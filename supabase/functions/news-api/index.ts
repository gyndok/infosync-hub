import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsPoint {
  id: string;
  lat: number;
  lon: number;
  place: string;
  article_count: number;
  top_topics: string[];
  last_updated: string;
  sample_headlines: Array<{
    title: string;
    source: string;
    url: string;
    published_at: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const topics = url.searchParams.get('topics')?.split(',').filter(Boolean) || [];
    const lang = url.searchParams.get('lang') || 'all';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const sources = url.searchParams.get('sources')?.split(',').filter(Boolean) || [];
    const minCountStr = url.searchParams.get('minCount') || '1';
    const minCount = parseInt(minCountStr, 10);

    console.log('News API request:', {
      query, topics, lang, from, to, sources, minCount
    });

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create cache key
    const cacheKey = `news_${JSON.stringify({
      query, topics, lang, from, to, sources, minCount
    })}`;

    // Check cache first
    const { data: cachedData } = await supabase
      .from('api_cache')
      .select('data, created_at')
      .eq('key', cacheKey)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes cache
      .single();

    if (cachedData) {
      console.log('Returning cached news data');
      return new Response(JSON.stringify(cachedData.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch from external APIs
    let newsPoints: NewsPoint[] = [];

    try {
      // Try GDELT first (if available)
      const gdeltData = await fetchFromGDELT(query, from, to);
      if (gdeltData && gdeltData.length > 0) {
        newsPoints = processGDELTData(gdeltData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GDELT API failed';
      console.log('GDELT failed, trying fallback APIs:', errorMessage);
    }

    // Fallback to NewsAPI if GDELT failed
    if (newsPoints.length === 0) {
      try {
        const newsApiKey = Deno.env.get('NEWSAPI_KEY');
        if (newsApiKey) {
          const newsApiData = await fetchFromNewsAPI(newsApiKey, query, lang, from, to);
          if (newsApiData?.articles?.length > 0) {
            newsPoints = await processNewsAPIData(newsApiData.articles);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'NewsAPI failed';
        console.log('NewsAPI failed, using sample data:', errorMessage);
      }
    }

    // Final fallback to sample data
    if (newsPoints.length === 0) {
      console.log('Using sample data as fallback');
      const sampleData = await getSampleData();
      newsPoints = sampleData.points;
    }

    // Apply filters
    const filteredPoints = filterNewsPoints(newsPoints, {
      query, topics, sources, minCount
    });

    // Limit to 1000 points max
    const limitedPoints = filteredPoints.slice(0, 1000);

    const result = {
      points: limitedPoints,
      total: filteredPoints.length,
      cached: false,
    };

    // Cache the result
    await supabase
      .from('api_cache')
      .upsert({
        key: cacheKey,
        data: result,
        created_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in news API:', errorMessage);
    
    // Return sample data on error
    const sampleData = await getSampleData();
    return new Response(JSON.stringify(sampleData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchFromGDELT(query: string, from: string, to: string): Promise<any[] | null> {
  // GDELT API implementation would go here
  // For now, return null to use fallback
  return null;
}

async function fetchFromNewsAPI(apiKey: string, query: string, lang: string, from: string, to: string) {
  const params = new URLSearchParams({
    apiKey,
    q: query || 'news',
    sortBy: 'publishedAt',
    pageSize: '100',
  });

  if (lang !== 'all') {
    params.set('language', lang);
  }
  if (from) {
    params.set('from', from);
  }
  if (to) {
    params.set('to', to);
  }

  const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status}`);
  }

  return await response.json();
}

async function processNewsAPIData(articles: any[]): Promise<NewsPoint[]> {
  const locationGroups: { [key: string]: any[] } = {};

  // Group articles by location (simplified - in reality you'd use proper geocoding)
  for (const article of articles) {
    const location = extractLocation(article.title + ' ' + article.description);
    if (location) {
      if (!locationGroups[location.place]) {
        locationGroups[location.place] = [];
      }
      locationGroups[location.place].push({
        ...article,
        lat: location.lat,
        lon: location.lon,
      });
    }
  }

  // Convert to NewsPoint format
  const newsPoints: NewsPoint[] = [];
  for (const [place, articles] of Object.entries(locationGroups)) {
    if (articles.length === 0) continue;

    const firstArticle = articles[0];
    const topics = extractTopics(articles);
    
    newsPoints.push({
      id: `${place.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      lat: firstArticle.lat,
      lon: firstArticle.lon,
      place,
      article_count: articles.length,
      top_topics: topics,
      last_updated: new Date().toISOString(),
      sample_headlines: articles.slice(0, 5).map(a => ({
        title: a.title,
        source: a.source?.name || 'Unknown',
        url: a.url,
        published_at: a.publishedAt,
      })),
    });
  }

  return newsPoints;
}

function extractLocation(text: string): { place: string; lat: number; lon: number } | null {
  // Simplified location extraction - in reality you'd use proper NLP
  const locations = [
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { name: 'Moscow', lat: 55.7558, lon: 37.6176 },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  ];

  for (const location of locations) {
    if (text.toLowerCase().includes(location.name.toLowerCase())) {
      return { place: location.name, lat: location.lat, lon: location.lon };
    }
  }

  return null;
}

function extractTopics(articles: any[]): string[] {
  // Simplified topic extraction
  const topicKeywords = {
    politics: ['election', 'government', 'president', 'minister', 'parliament', 'vote'],
    business: ['market', 'economy', 'stock', 'company', 'business', 'trade'],
    tech: ['technology', 'software', 'ai', 'internet', 'digital', 'tech'],
    health: ['health', 'medical', 'hospital', 'disease', 'covid', 'vaccine'],
    sports: ['football', 'soccer', 'basketball', 'baseball', 'sport', 'game'],
    environment: ['climate', 'environment', 'green', 'carbon', 'pollution'],
  };

  const topicCounts: { [key: string]: number } = {};
  const allText = articles.map(a => a.title + ' ' + a.description).join(' ').toLowerCase();

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    topicCounts[topic] = keywords.reduce((count, keyword) => {
      return count + (allText.match(new RegExp(keyword, 'g'))?.length || 0);
    }, 0);
  }

  return Object.entries(topicCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
}

function processGDELTData(data: any[]): NewsPoint[] {
  // GDELT processing would go here
  return [];
}

function filterNewsPoints(points: NewsPoint[], filters: {
  query: string;
  topics: string[];
  sources: string[];
  minCount: number;
}): NewsPoint[] {
  return points.filter(point => {
    // Query filter
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchesHeadlines = point.sample_headlines.some(h => 
        h.title.toLowerCase().includes(query)
      );
      const matchesPlace = point.place.toLowerCase().includes(query);
      if (!matchesHeadlines && !matchesPlace) return false;
    }

    // Topic filter
    if (filters.topics.length > 0) {
      const hasMatchingTopic = point.top_topics.some(topic => 
        filters.topics.includes(topic)
      );
      if (!hasMatchingTopic) return false;
    }

    // Min count filter
    if (point.article_count < filters.minCount) return false;

    // Source filter
    if (filters.sources.length > 0) {
      const hasMatchingSource = point.sample_headlines.some(h =>
        filters.sources.some(source => h.source.toLowerCase().includes(source.toLowerCase()))
      );
      if (!hasMatchingSource) return false;
    }

    return true;
  });
}

async function getSampleData() {
  return {
    "points": [
      {
        "id": "tokyo-2025-09-26-01",
        "lat": 35.6762,
        "lon": 139.6503,
        "place": "Tokyo, Japan",
        "article_count": 42,
        "top_topics": ["tech", "economy"],
        "last_updated": "2025-09-26T22:05:00Z",
        "sample_headlines": [
          {"title": "Chipmakers rally on new export guidance", "source": "Nikkei", "url": "https://example.com/a", "published_at": "2025-09-26T21:40:00Z"},
          {"title": "Yen spikes after BoJ remarks", "source": "Reuters", "url": "https://example.com/b", "published_at": "2025-09-26T21:10:00Z"}
        ]
      },
      {
        "id": "london-2025-09-26-01",
        "lat": 51.5074,
        "lon": -0.1278,
        "place": "London, UK",
        "article_count": 38,
        "top_topics": ["politics", "economy"],
        "last_updated": "2025-09-26T21:55:00Z",
        "sample_headlines": [
          {"title": "Parliament debates new climate legislation", "source": "BBC", "url": "https://example.com/c", "published_at": "2025-09-26T21:30:00Z"},
          {"title": "Sterling rises on inflation data", "source": "Financial Times", "url": "https://example.com/d", "published_at": "2025-09-26T21:00:00Z"}
        ]
      },
      {
        "id": "newyork-2025-09-26-01",
        "lat": 40.7128,
        "lon": -74.0060,
        "place": "New York, USA",
        "article_count": 67,
        "top_topics": ["business", "tech"],
        "last_updated": "2025-09-26T22:10:00Z",
        "sample_headlines": [
          {"title": "Wall Street opens higher on Fed signals", "source": "Wall Street Journal", "url": "https://example.com/e", "published_at": "2025-09-26T21:45:00Z"},
          {"title": "Tech giants report strong earnings", "source": "Bloomberg", "url": "https://example.com/f", "published_at": "2025-09-26T21:15:00Z"}
        ]
      }
    ]
  };
}