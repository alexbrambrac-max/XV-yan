import type { Config } from "@netlify/functions";
import { photos, json } from "../lib/store.mts";

const MAX = 4 * 1024 * 1024;
const clean = (s: string | null, n: number) =>
  (s ? decodeURIComponent(s) : "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);

export default async (req: Request) => {
  const type = req.headers.get("content-type") || "";
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({ error: "Solo se aceptan fotos." }, 415);
  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: "La foto llegó vacía." }, 400);
  if (buf.byteLength > MAX) return json({ error: "La foto es demasiado grande." }, 413);

  let name = "", msg = "";
  try {
    name = clean(req.headers.get("x-nombre"), 40);
    msg = clean(req.headers.get("x-mensaje"), 90);
  } catch {}
  const ts = Date.now();
  const id = `${ts.toString().padStart(14, "0")}-${crypto.randomUUID().slice(0, 8)}`;
  const store = photos();
  await store.set(`img/${id}`, buf, { metadata: { type } });
  const meta = { id, name, msg, ts };
  await store.setJSON(`meta/${id}`, meta);
  return json(meta, 201);
};

export const config: Config = {
  path: "/api/upload",
  method: "POST",
  rateLimit: { windowLimit: 15, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
