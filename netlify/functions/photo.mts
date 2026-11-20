import type { Config, Context } from "@netlify/functions";
import { photos } from "../lib/store.mts";

export default async (req: Request, context: Context) => {
  const id = context.params.id;
  if (!/^[0-9]{14}-[0-9a-f]{8}$/.test(id)) return new Response("No encontrada", { status: 404 });
  const entry = await photos().getWithMetadata(`img/${id}`, { type: "arrayBuffer" });
  if (entry === null) return new Response("No encontrada", { status: 404 });
  const headers: Record<string, string> = {
    "content-type": (entry.metadata?.type as string) || "image/jpeg",
    "cache-control": "public, max-age=31536000, immutable",
  };
  if (new URL(req.url).searchParams.has("descargar"))
    headers["content-disposition"] = `attachment; filename="xv-yan-${id}.jpg"`;
  return new Response(entry.data, { headers });
};

export const config: Config = { path: "/api/foto/:id", method: "GET" };
