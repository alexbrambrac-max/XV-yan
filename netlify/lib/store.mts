import { getStore } from "@netlify/blobs";
export const photos = () => getStore({ name: "fotos-xv", consistency: "strong" });
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
