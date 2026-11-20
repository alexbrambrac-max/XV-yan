import type { Config } from "@netlify/functions";
import { photos, json } from "../lib/store.mts";

// Devuelve todos los ids y el detalle solo de los posteriores a ?since=
export default async (req: Request) => {
  const clave = req.headers.get("x-clave") || "";
  const validas = [Netlify.env.get("ADMIN_PASSWORD"), Netlify.env.get("PANTALLA_KEY")].filter(Boolean);
  if (!validas.includes(clave)) return json({ error: "Clave incorrecta." }, 401);
  const since = new URL(req.url).searchParams.get("since") || "";
  const store = photos();
  const { blobs } = await store.list({ prefix: "meta/" });
  const ids = blobs.map((b) => b.key.slice(5)).sort();
  const fresh = ids.filter((id) => id > since);
  const items = (
    await Promise.all(fresh.map((id) => store.get(`meta/${id}`, { type: "json" })))
  ).filter(Boolean);
  return json({ ids, items });
};

export const config: Config = { path: "/api/fotos", method: "GET" };
