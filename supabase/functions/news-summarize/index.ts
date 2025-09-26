import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryData {
  id: string;
  summary: string;
  citations: Array<{ title: string; url: string }>;
  sentiment: {
    polarity: number;
    subjectivity: number;
  };
  diversity: {
    outlets: number;
    countries: number;
  };
  bias: Array<"left" | "lean_left" | "center" | "lean_right" | "right">;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pointId = url.searchParams.get('id');

    if (!pointId) {
      return new Response(JSON.stringify({ error: 'Missing point ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Summarize request for point:', pointId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const cacheKey = `summary_${pointId}`;
    const { data: cachedData } = await supabase
      .from('api_cache')
      .select('data, created_at')
      .eq('key', cacheKey)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 minutes cache
      .single();

    if (cachedData) {
      console.log('Returning cached summary data');
      return new Response(JSON.stringify(cachedData.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate summary (this would normally call an AI service)
    const summary = await generateSummary(pointId);

    // Cache the result
    await supabase
      .from('api_cache')
      .upsert({
        key: cacheKey,
        data: summary,
        created_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in summarize API:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate summary',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSummary(pointId: string): Promise<SummaryData> {
  // This would normally integrate with OpenAI, Claude, or other AI services
  // For demo purposes, we'll return mock data
  
  const summaries = [
    "This region is experiencing significant political and economic developments with widespread coverage across multiple news outlets. Key events include policy announcements, market movements, and diplomatic activities that are shaping the current landscape.",
    "Breaking news from this location indicates major shifts in the local situation with international implications. Multiple verified sources are reporting on developments that span economic, political, and social spheres.",
    "Current events in this area show sustained media attention with coverage spanning multiple topics and perspectives. The situation continues to evolve with new developments being reported by various reliable news sources.",
  ];

  const biasOptions: Array<Array<"left" | "lean_left" | "center" | "lean_right" | "right">> = [
    ["center"],
    ["lean_left", "center"],
    ["center", "lean_right"],
    ["left", "center", "right"],
  ];

  return {
    id: pointId,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    citations: [
      { title: "Major news outlet reports significant developments", url: "https://example.com/1" },
      { title: "International coverage of ongoing situation", url: "https://example.com/2" },
      { title: "Analysis and expert commentary on events", url: "https://example.com/3" },
    ],
    sentiment: {
      polarity: (Math.random() - 0.5) * 2, // -1 to 1
      subjectivity: Math.random(), // 0 to 1
    },
    diversity: {
      outlets: Math.floor(Math.random() * 15) + 5, // 5-20 outlets
      countries: Math.floor(Math.random() * 8) + 2, // 2-10 countries
    },
    bias: biasOptions[Math.floor(Math.random() * biasOptions.length)],
  };
}

// Helper function to analyze sentiment (would integrate with AI service)
function analyzeSentiment(text: string): { polarity: number; subjectivity: number } {
  // Mock sentiment analysis
  return {
    polarity: (Math.random() - 0.5) * 2,
    subjectivity: Math.random(),
  };
}

// Helper function to determine source bias (would use bias database)
function getSourceBias(sources: string[]): Array<"left" | "lean_left" | "center" | "lean_right" | "right"> {
  // Mock bias analysis
  const biases: Array<"left" | "lean_left" | "center" | "lean_right" | "right"> = ["left", "lean_left", "center", "lean_right", "right"];
  const result: Array<"left" | "lean_left" | "center" | "lean_right" | "right"> = [];
  
  for (let i = 0; i < Math.min(sources.length, 3); i++) {
    result.push(biases[Math.floor(Math.random() * biases.length)]);
  }
  
  return result.length > 0 ? result : ["center"];
}