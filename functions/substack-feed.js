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

  const fetchFeed = () =>
    fetch(feed, {
      headers: { "User-Agent": "Mozilla/5.0 (FullLifeExpedition feed proxy)" },
      cf: {
        // Cache only good responses; never cache upstream errors (e.g. Substack 522).
        cacheTtlByStatus: { "200-299": 600, "300-399": 0, "400-599": 0 },
        cacheEverything: true,
      },
    });

  // One retry to smooth over transient upstream hiccups.
  let upstream;
  try {
    upstream = await fetchFeed();
    if (!upstream.ok) upstream = await fetchFeed();
  } catch (e) {
    try {
      upstream = await fetchFeed();
    } catch (e2) {
      return new Response("Upstream feed fetch failed", { status: 502 });
    }
  }

  const body = await upstream.text();
  const looksValid = upstream.ok && body.includes("<item");

  return new Response(body, {
    status: looksValid ? 200 : 502,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      // The browser keeps its static fallback on a non-200, so short client cache is fine.
      "cache-control": looksValid ? "public, max-age=300" : "no-store",
      "access-control-allow-origin": "*",
    },
  });
}
