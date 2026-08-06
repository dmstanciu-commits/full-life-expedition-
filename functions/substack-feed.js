// Cloudflare Pages Function — same-origin proxy for the Substack RSS feed.
// Removes the dependency on external CORS proxies (e.g. allorigins.win) that go down.
// Route: /substack-feed  (optional ?sectionId=NNN for a single Substack section)
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sectionId = url.searchParams.get("sectionId");
  let feed = "https://fulllifeexpedition.substack.com/feed";
  if (sectionId && /^\d+$/.test(sectionId)) {
    feed += "?sectionId=" + sectionId;
  }

  let upstream;
  try {
    upstream = await fetch(feed, {
      headers: { "User-Agent": "Mozilla/5.0 (FullLifeExpedition feed proxy)" },
      cf: { cacheTtl: 600, cacheEverything: true },
    });
  } catch (e) {
    return new Response("Upstream feed fetch failed", { status: 502 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.ok ? 200 : upstream.status,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=600",
      "access-control-allow-origin": "*",
    },
  });
}
