import { getStore } from "@/lib/data";
import { readImage } from "@/lib/data/media";

/** Serves uploaded images. Ids are random and never reused, so they can be cached forever. */
export async function GET(_request: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  const m = /^([A-Za-z0-9]+)\.webp$/.exec(file);
  const data = m ? await readImage(getStore(), m[1]) : null;
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "content-type": "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
