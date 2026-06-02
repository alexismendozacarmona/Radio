import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

/* ── Retry helper ──────────────────────────────────────────
   Retries a kv operation up to `attempts` times when a
   transient connection error occurs ("send was called before
   connect", "connection reset", etc.)
─────────────────────────────────────────────────────────── */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes("send was called before connect") ||
        msg.includes("connection reset") ||
        msg.includes("broken pipe") ||
        msg.includes("Connection refused");
      if (!isTransient) throw err;           // non-transient → bubble up immediately
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, 120 * (i + 1))); // 120ms, 240ms back-off
      }
    }
  }
  throw lastErr;
}

// PIN de administrador del chat (mismo que Noticias/Banner).
// Nota: verificación ligera — el PIN viaja en el cliente; mejora futura: token server-side.
const CHAT_ADMIN_PIN = "1717";

// ── Health ─────────────────────────────────────────────────
app.get("/make-server-a7fd6a14/health", (c) => c.json({ status: "ok" }));

// ── CHAT ───────────────────────────────────────────────────
// GET last 100 messages
app.get("/make-server-a7fd6a14/chat/messages", async (c) => {
  try {
    const raw = await withRetry(() => kv.getByPrefix("chat:"));
    const messages = raw
      .filter(Boolean)
      .sort((a: any, b: any) => (a.ts ?? 0) - (b.ts ?? 0))
      .slice(-100);
    return c.json(messages);
  } catch (err) {
    console.log("Error fetching chat messages:", err);
    return c.json({ error: "Error fetching messages" }, 500);
  }
});

// POST new message
app.post("/make-server-a7fd6a14/chat/messages", async (c) => {
  try {
    const body = await c.req.json();
    const { user, text, avatar, color, deviceId, gender, isAdmin } = body;
    if (!user || !text) return c.json({ error: "Missing fields: user, text required" }, 400);
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const id = `${ts}_${rand}`;
    const msg = {
      id,
      user: String(user).slice(0, 30),
      text: String(text).slice(0, 500),
      avatar,
      color: color ?? "rgba(224,176,0,0.9)",
      deviceId: deviceId ?? "",
      gender: gender ?? "otro",
      isAdmin: !!isAdmin,
      edited: false,
      reactions: {},
      ts,
    };
    await withRetry(() => kv.set(`chat:${id}`, msg));
    return c.json(msg, 201);
  } catch (err) {
    console.log("Error posting chat message:", err);
    return c.json({ error: "Error posting message" }, 500);
  }
});

// PUT edit a message — solo el dueño (por deviceId)
app.put("/make-server-a7fd6a14/chat/messages/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { deviceId, text } = await c.req.json();
    if (!deviceId || !text || !String(text).trim()) {
      return c.json({ error: "Missing deviceId or text" }, 400);
    }
    const existing = await withRetry(() => kv.get(`chat:${id}`));
    if (!existing) return c.json({ error: "Message not found" }, 404);
    if (existing.deviceId !== deviceId) return c.json({ error: "Not allowed" }, 403);
    const updated = {
      ...existing,
      text: String(text).slice(0, 500),
      edited: true,
      editedTs: Date.now(),
    };
    await withRetry(() => kv.set(`chat:${id}`, updated));
    return c.json(updated);
  } catch (err) {
    console.log("Error editing chat message:", err);
    return c.json({ error: "Error editing message" }, 500);
  }
});

// DELETE a message — admin (PIN) o el propio dueño (deviceId)
app.delete("/make-server-a7fd6a14/chat/messages/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const { deviceId, adminPin } = body;
    const existing = await withRetry(() => kv.get(`chat:${id}`));
    if (!existing) return c.json({ ok: true }); // ya no existe
    const isOwner = deviceId && existing.deviceId === deviceId;
    const isAdmin = adminPin && adminPin === CHAT_ADMIN_PIN;
    if (!isOwner && !isAdmin) return c.json({ error: "Not allowed" }, 403);
    await withRetry(() => kv.del(`chat:${id}`));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error deleting chat message:", err);
    return c.json({ error: "Error deleting message" }, 500);
  }
});

// POST toggle a reaction on a message
app.post("/make-server-a7fd6a14/chat/messages/:id/react", async (c) => {
  try {
    const id = c.req.param("id");
    const { deviceId, emoji } = await c.req.json();
    if (!deviceId || !emoji) return c.json({ error: "Missing deviceId or emoji" }, 400);
    const existing = await withRetry(() => kv.get(`chat:${id}`));
    if (!existing) return c.json({ error: "Message not found" }, 404);
    const reactions: Record<string, string[]> = existing.reactions ?? {};
    const list = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
    const idx = list.indexOf(deviceId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(deviceId);
    if (list.length > 0) reactions[emoji] = list;
    else delete reactions[emoji];
    const updated = { ...existing, reactions };
    await withRetry(() => kv.set(`chat:${id}`, updated));
    return c.json(updated);
  } catch (err) {
    console.log("Error reacting to chat message:", err);
    return c.json({ error: "Error reacting" }, 500);
  }
});

// ── NEWS ───────────────────────────────────────────────────
app.get("/make-server-a7fd6a14/news", async (c) => {
  try {
    const content = await withRetry(() => kv.get("news_content"));
    return c.json(content ?? null);
  } catch (err) {
    console.log("Error fetching news:", err);
    return c.json({ error: "Error fetching news" }, 500);
  }
});

app.put("/make-server-a7fd6a14/news", async (c) => {
  try {
    const body = await c.req.json();
    await withRetry(() => kv.set("news_content", body));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error saving news:", err);
    return c.json({ error: "Error saving news" }, 500);
  }
});

// ── AD BANNER ──────────────────────────────────────────────
app.get("/make-server-a7fd6a14/ads", async (c) => {
  try {
    const slides = await withRetry(() => kv.get("ad_slides"));
    return c.json(slides ?? null);
  } catch (err) {
    console.log("Error fetching ads:", err);
    return c.json({ error: "Error fetching ads" }, 500);
  }
});

app.put("/make-server-a7fd6a14/ads", async (c) => {
  try {
    const body = await c.req.json();
    await withRetry(() => kv.set("ad_slides", body));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error saving ads:", err);
    return c.json({ error: "Error saving ads" }, 500);
  }
});

// ── APP VERSION (aviso de actualización) ───────────────────
app.get("/make-server-a7fd6a14/version", async (c) => {
  try {
    const v = await withRetry(() => kv.get("app_version"));
    return c.json(v ?? null);
  } catch (err) {
    console.log("Error fetching version:", err);
    return c.json({ error: "Error fetching version" }, 500);
  }
});

app.put("/make-server-a7fd6a14/version", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || body.adminPin !== CHAT_ADMIN_PIN) return c.json({ error: "Not allowed" }, 403);
    const { latest, url, notes, mandatory } = body;
    await withRetry(() => kv.set("app_version", { latest, url, notes: notes ?? "", mandatory: !!mandatory }));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error saving version:", err);
    return c.json({ error: "Error saving version" }, 500);
  }
});

// ── PRESENCE ───────────────────────────────────────────────
// Register / renew presence (heartbeat)
app.post("/make-server-a7fd6a14/presence/ping", async (c) => {
  try {
    const { deviceId } = await c.req.json();
    if (!deviceId) return c.json({ error: "Missing deviceId" }, 400);
    await withRetry(() => kv.set(`presence:${deviceId}`, { deviceId, ts: Date.now() }));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error updating presence:", err);
    return c.json({ error: "Error updating presence" }, 500);
  }
});

// Remove presence on exit
app.delete("/make-server-a7fd6a14/presence/ping", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const deviceId = body?.deviceId;
    if (!deviceId) return c.json({ error: "Missing deviceId" }, 400);
    await withRetry(() => kv.del(`presence:${deviceId}`));
    return c.json({ ok: true });
  } catch (err) {
    console.log("Error removing presence:", err);
    return c.json({ error: "Error removing presence" }, 500);
  }
});

// Count active presences (entries updated within last 90s)
app.get("/make-server-a7fd6a14/presence/count", async (c) => {
  try {
    const entries = await withRetry(() => kv.getByPrefix("presence:"));
    const cutoff = Date.now() - 90_000; // 90 seconds = 3 missed heartbeats
    const active = entries.filter((e: any) => e && e.ts > cutoff);
    return c.json({ count: active.length });
  } catch (err) {
    console.log("Error counting presence:", err);
    return c.json({ error: "Error counting presence" }, 500);
  }
});

Deno.serve(app.fetch);