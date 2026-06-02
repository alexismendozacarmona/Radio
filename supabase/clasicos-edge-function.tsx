// ════════════════════════════════════════════════════════════════════════
//  Edge Function: make-server-a7fd6a14  (Clásicos del Reggaetón)
//  ARCHIVO ÚNICO listo para pegar en el dashboard de Supabase.
//  (fusiona index.tsx + kv_store.tsx en un solo archivo)
//
//  Requiere la tabla:
//    create table if not exists public.kv_store_a7fd6a14 (
//      key text not null primary key,
//      value jsonb not null
//    );
// ════════════════════════════════════════════════════════════════════════
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ── KV store (inline) ───────────────────────────────────────
// Usa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (inyectadas automáticamente
// por Supabase en toda Edge Function — no hay que configurarlas a mano).
const sb = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const { error } = await sb().from("kv_store_a7fd6a14").upsert({ key, value });
    if (error) throw new Error(error.message);
  },
  get: async (key: string): Promise<any> => {
    const { data, error } = await sb()
      .from("kv_store_a7fd6a14").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },
  del: async (key: string): Promise<void> => {
    const { error } = await sb().from("kv_store_a7fd6a14").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
  getByPrefix: async (prefix: string): Promise<any[]> => {
    const { data, error } = await sb()
      .from("kv_store_a7fd6a14").select("key, value").like("key", prefix + "%");
    if (error) throw new Error(error.message);
    return data?.map((d: any) => d.value) ?? [];
  },
};

const app = new Hono();

app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

/* ── Retry helper (errores transitorios de conexión) ──────── */
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
      if (!isTransient) throw err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, 120 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

// PIN de administrador del chat (mismo que Noticias/Banner).
const CHAT_ADMIN_PIN = "1717";

// ── Health ─────────────────────────────────────────────────
app.get("/make-server-a7fd6a14/health", (c) => c.json({ status: "ok" }));

// ── CHAT ───────────────────────────────────────────────────
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
    if (!existing) return c.json({ ok: true });
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

// ── PRESENCE ───────────────────────────────────────────────
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

app.get("/make-server-a7fd6a14/presence/count", async (c) => {
  try {
    const entries = await withRetry(() => kv.getByPrefix("presence:"));
    const cutoff = Date.now() - 90_000;
    const active = entries.filter((e: any) => e && e.ts > cutoff);
    return c.json({ count: active.length });
  } catch (err) {
    console.log("Error counting presence:", err);
    return c.json({ error: "Error counting presence" }, 500);
  }
});

Deno.serve(app.fetch);
