// Minimal RSS fetcher edge function with CORS and simple parsing
// Fetches and parses whitelisted RSS feeds and returns normalized JSON

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Whitelisted RSS feeds (add only trusted sources)
const FEEDS: Record<string, string> = {
  ap: "https://feedx.net/rss/ap.xml",
  reuters: "https://feeds.reuters.com/reuters/topNews",
  bbc: "https://feeds.bbci.co.uk/news/rss.xml",
  guardian: "https://www.theguardian.com/world/rss",
  khou_sports: "https://www.khou.com/feeds/syndication/rss/sports",
  khou_astros: "https://www.khou.com/feeds/syndication/rss/astros",
  khou_rockets: "https://www.khou.com/feeds/syndication/rss/rockets",
  khou_texans: "https://www.khou.com/feeds/syndication/rss/texans",
  khou_local: "https://www.khou.com/feeds/syndication/rss/local",
  texas_longhorns: "https://texaslonghorns.com/rss?path=football",
};

function stripCDATA(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/]]>\s*$/, "")
    .trim();
}

function matchTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? stripCDATA(m[1]) : null;
}

function parseItems(xml: string, source: string) {
  // Basic RSS 2.0 parsing; works for most feeds listed above
  const items: Array<{
    title: string;
    link: string;
    pubDate?: string;
    source: string;
  }> = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRe) || [];
  for (const block of blocks) {
    const title = matchTag(block, "title") || "";
    const link = matchTag(block, "link") || "";
    const pubDate =
      matchTag(block, "pubDate") ||
      matchTag(block, "published") ||
      matchTag(block, "updated") ||
      undefined;
    if (title && link) {
      items.push({ title, link, pubDate, source });
    }
  }
  return items;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=120",
    },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("RSS Fetcher request method:", req.method);

    let sources = ["ap"];
    let limit = 20;

    // Try to parse JSON body if it exists
    if (req.method === "POST" && req.body) {
      try {
        const body = await req.json();
        sources = body.sources || ["ap"];
        limit = body.limit || 20;
        console.log("Parsed request body:", { sources, limit });
      } catch (e) {
        console.log("Failed to parse JSON body, using defaults:", e.message);
      }
    }

    // Validate sources against whitelist
    const uniqueSources = Array.from(
      new Set((sources || []).filter((s) => s in FEEDS)),
    );
    if (uniqueSources.length === 0) uniqueSources.push("ap");

    console.log("Using sources:", uniqueSources);

    // Fetch feeds in parallel with per-source error handling
    const results = await Promise.all(
      uniqueSources.map(async (src) => {
        try {
          const url = FEEDS[src];
          console.log(`Fetching RSS from ${src}: ${url}`);
          const res = await fetch(url, { redirect: "follow" });
          if (!res.ok) {
            console.log(
              `Failed to fetch ${src}: ${res.status} ${res.statusText}`,
            );
            return [] as ReturnType<typeof parseItems>;
          }
          const xml = await res.text();
          const items = parseItems(xml, src);
          console.log(`Parsed ${items.length} items from ${src}`);
          return items;
        } catch (err) {
          console.log(`Error fetching ${src}:`, err.message);
          return [] as ReturnType<typeof parseItems>;
        }
      }),
    );

    // Flatten, sort by date desc, and limit
    const allItems = results.flat();
    console.log(`Total items before sorting: ${allItems.length}`);

    allItems.sort((a, b) => {
      const ad = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const bd = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return bd - ad;
    });

    const items = allItems.slice(
      0,
      Math.max(1, Math.min(50, Number(limit) || 20)),
    );
    console.log(`Returning ${items.length} items`);

    return json({ success: true, items, sources: uniqueSources });
  } catch (err) {
    console.error("RSS Fetcher error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
});
