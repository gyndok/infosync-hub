// Minimal RSS fetcher edge function with CORS and simple parsing
// Fetches and parses whitelisted RSS feeds and returns normalized JSON

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Whitelisted RSS feeds (add only trusted sources)
const FEEDS: Record<string, string> = {
  ap: 'https://feedx.net/rss/ap.xml',
  reuters: 'https://feeds.reuters.com/reuters/topNews',
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  guardian: 'https://www.theguardian.com/world/rss',
};

function stripCDATA(text: string | null): string {
  if (!text) return '';
  return text.replace(/^\s*<!\[CDATA\[/, '').replace(/]]>\s*$/, '').trim();
}

function matchTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? stripCDATA(m[1]) : null;
}

function parseItems(xml: string, source: string) {
  // Basic RSS 2.0 parsing; works for most feeds listed above
  const items: Array<{ title: string; link: string; pubDate?: string; source: string }> = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRe) || [];
  for (const block of blocks) {
    const title = matchTag(block, 'title') || '';
    const link = matchTag(block, 'link') || '';
    const pubDate = matchTag(block, 'pubDate') || matchTag(block, 'published') || matchTag(block, 'updated') || undefined;
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
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
    },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sources = ['reuters'], limit = 20 } = await req.json().catch(() => ({ sources: ['reuters'], limit: 20 })) as { sources?: string[]; limit?: number };

    // Validate sources against whitelist
    const uniqueSources = Array.from(new Set((sources || []).filter((s) => s in FEEDS)));
    if (uniqueSources.length === 0) uniqueSources.push('ap');

    // Fetch feeds in parallel with per-source error handling
    const results = await Promise.all(
      uniqueSources.map(async (src) => {
        try {
          const url = FEEDS[src];
          const res = await fetch(url, { redirect: 'follow' });
          if (!res.ok) return [] as ReturnType<typeof parseItems>;
          const xml = await res.text();
          return parseItems(xml, src);
        } catch (_) {
          return [] as ReturnType<typeof parseItems>;
        }
      }),
    );

    // Flatten, sort by date desc, and limit
    const allItems = results.flat();
    allItems.sort((a, b) => {
      const ad = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const bd = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return bd - ad;
    });

    const items = allItems.slice(0, Math.max(1, Math.min(50, Number(limit) || 20)));

    return json({ success: true, items, sources: uniqueSources });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ success: false, error: message }, 500);
  }
});
