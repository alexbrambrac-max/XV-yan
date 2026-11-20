import type { Config } from "@netlify/functions";
import { photos, json } from "../lib/store.mts";

export default async (req: Request) => {
  const pass = Netlify.env.get("ADMIN_PASSWORD");
  if (!pass || req.headers.get("x-admin") !== pass) return json({ error: "Contraseña incorrecta." }, 401);
  const { id, check } = await req.json().catch(() => ({}));
  if (check) return json({ ok: true });
  if (typeof id !== "string" || !/^[0-9]{14}-[0-9a-f]{8}$/.test(id)) return json({ error: "Foto inválida." }, 400);
  const store = photos();
  await store.delete(`meta/${id}`);
  await store.delete(`img/${id}`);
  return json({ ok: true });
};

export const config: Config = {
  path: "/api/borrar",
  method: "POST",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
