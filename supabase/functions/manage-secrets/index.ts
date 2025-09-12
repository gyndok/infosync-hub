import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    console.log(`Manage secrets action: ${action} for user ${user.id}`);

    if (action === 'list') {
      // List available API services and their secret requirements
      const { data: services, error: servicesError } = await supabase
        .from('api_services')
        .select('service_name, is_enabled');

      if (servicesError) {
        throw new Error('Failed to fetch services');
      }

      const secretsStatus = services?.map(service => {
        const apiKeyName = `${service.service_name.toUpperCase()}_API_KEY`;
        const hasSecret = !!Deno.env.get(apiKeyName);
        
        return {
          service_name: service.service_name,
          is_enabled: service.is_enabled,
          secret_name: apiKeyName,
          has_secret: hasSecret,
          is_required: service.service_name !== 'crypto', // CoinGecko doesn't require API key for basic calls
        };
      }) || [];

      return new Response(JSON.stringify({
        success: true,
        secrets_status: secretsStatus,
        instructions: {
          news: "Get your API key from https://newsapi.org/",
          weather: "Get your API key from https://openweathermap.org/api",
          finance: "Get your API key from https://polygon.io/",
          sports: "Get your API key from https://the-odds-api.com/",
          crypto: "No API key required for basic CoinGecko calls"
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'test') {
      // Test API keys by making a simple request
      const { service } = await req.json();
      
      if (!service) {
        throw new Error('Service name is required');
      }

      const apiKeyName = `${service.toUpperCase()}_API_KEY`;
      const apiKey = Deno.env.get(apiKeyName);

      if (!apiKey && service !== 'crypto') {
        throw new Error(`API key not found for ${service}`);
      }

      // Test the API key with a simple request
      const testEndpoints: Record<string, string> = {
        'news': 'https://newsapi.org/v2/everything?q=test&pageSize=1',
        'weather': 'https://api.openweathermap.org/data/2.5/weather?q=London',
        'finance': 'https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02',
        'sports': 'https://api.the-odds-api.com/v4/sports',
        'crypto': 'https://api.coingecko.com/api/v3/ping'
      };

      const testUrl = testEndpoints[service];
      if (!testUrl) {
        throw new Error(`No test endpoint defined for ${service}`);
      }

      let fullTestUrl = testUrl;
      if (apiKey) {
        const urlParams = new URLSearchParams();
        switch (service) {
          case 'news':
            urlParams.append('apiKey', apiKey);
            break;
          case 'weather':
            urlParams.append('appid', apiKey);
            break;
          case 'finance':
            urlParams.append('apikey', apiKey);
            break;
          case 'sports':
            urlParams.append('apiKey', apiKey);
            break;
        }
        
        if (urlParams.toString()) {
          fullTestUrl += (fullTestUrl.includes('?') ? '&' : '?') + urlParams.toString();
        }
      }

      const startTime = Date.now();
      try {
        const response = await fetch(fullTestUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'InfoWall Secret Test/1.0',
          },
        });

        const responseTime = Date.now() - startTime;
        const isValid = response.ok;

        let errorMessage = null;
        if (!response.ok) {
          const errorData = await response.text();
          errorMessage = `HTTP ${response.status}: ${errorData.substring(0, 200)}`;
        }

        return new Response(JSON.stringify({
          success: true,
          test_result: {
            service,
            is_valid: isValid,
            status_code: response.status,
            response_time_ms: responseTime,
            error_message: errorMessage,
            tested_at: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        return new Response(JSON.stringify({
          success: true,
          test_result: {
            service,
            is_valid: false,
            status_code: 0,
            response_time_ms: Date.now() - startTime,
            error_message: error.message,
            tested_at: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else if (action === 'health-summary') {
      // Get a quick health summary for the admin dashboard
      const { data: services } = await supabase
        .from('api_services')
        .select('service_name, is_enabled');

      const secretsStatus = services?.map(service => {
        const apiKeyName = `${service.service_name.toUpperCase()}_API_KEY`;
        return {
          service_name: service.service_name,
          has_secret: !!Deno.env.get(apiKeyName),
          is_enabled: service.is_enabled,
        };
      }) || [];

      // Get recent health data
      const { data: recentHealth } = await supabase
        .from('api_health_logs')
        .select('service_name, is_healthy, checked_at')
        .gte('checked_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('checked_at', { ascending: false });

      const healthSummary = secretsStatus.map(secret => {
        const recentChecks = recentHealth?.filter(h => h.service_name === secret.service_name) || [];
        const isHealthy = recentChecks.length > 0 ? recentChecks[0].is_healthy : null;
        
        return {
          ...secret,
          is_healthy: isHealthy,
          last_check: recentChecks[0]?.checked_at || null,
          recent_checks_count: recentChecks.length
        };
      });

      return new Response(JSON.stringify({
        success: true,
        health_summary: healthSummary,
        total_services: services?.length || 0,
        services_with_secrets: secretsStatus.filter(s => s.has_secret).length,
        enabled_services: secretsStatus.filter(s => s.is_enabled).length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action parameter');
    }

  } catch (error) {
    console.error('Error in manage-secrets function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});