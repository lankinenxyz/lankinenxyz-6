import { getCollectionImageUrl, type NotionImageCollection } from "@/lib/notion-other";

const pageIdPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const collections = new Set<string>(["books", "watches"]);

// The `v` param makes the URL change whenever the underlying Notion file does, so the optimized
// output can be cached for a long time without pinning a replaced photo.
const cacheControl = "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800";

// Only a guard against a genuinely hung S3 connection. Kept generous on purpose: a cold cache can
// have many originals downloading at once, and aborting those turns slow-but-working requests into
// broken images. Next does not time out internal image fetches, so this is the only deadline.
const upstreamTimeoutMs = 20000;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id") ?? "";
  const collection = searchParams.get("c") ?? "";

  if (!pageIdPattern.test(id) || !collections.has(collection)) {
    return new Response("Invalid image request", { status: 400 });
  }

  let imageUrl: string | null = null;

  try {
    imageUrl = await getCollectionImageUrl(collection as NotionImageCollection, id);
  } catch (error) {
    console.error("Failed to resolve Notion image", error);

    return new Response("Failed to resolve image", { status: 502 });
  }

  if (!imageUrl) {
    return new Response("No image", { status: 404 });
  }

  let upstream: Response;

  try {
    upstream = await fetch(imageUrl, { signal: AbortSignal.timeout(upstreamTimeoutMs) });
  } catch (error) {
    console.error("Notion image fetch failed", error);

    return new Response("Failed to fetch image", { status: 504 });
  }

  if (!upstream.ok || !upstream.body) {
    console.error(`Notion image fetch failed: ${upstream.status}`);

    return new Response("Failed to fetch image", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
    },
  });
}
