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
    const { user, text, avatar, color, deviceId } = body;
    if (!user || !text) return c.json({ error: "Missing fields: user, text required" }, 400);
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const id = `${ts}_${rand}`;
    const msg = { id, user, text, avatar, color: color ?? "rgba(224,176,0,0.9)", deviceId: deviceId ?? "", ts };
    await withRetry(() => kv.set(`chat:${id}`, msg));
    return c.json(msg, 201);
  } catch (err) {
    console.log("Error posting chat message:", err);
    return c.json({ error: "Error posting message" }, 500);
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