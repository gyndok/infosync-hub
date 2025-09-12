import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiServiceConfig {
  service_name: string;
  base_url: string;
  is_enabled: boolean;
  rate_limit_per_minute: number;
  cache_duration_minutes: number;
  timeout_seconds: number;
}

interface CacheEntry {
  data: any;
  expires_at: string;
}

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

    const { service, endpoint, params = {} } = await req.json();

    if (!service || !endpoint) {
      throw new Error('Service and endpoint are required');
    }

    console.log(`API Proxy request: ${service} - ${endpoint} for user ${user.id}`);

    // Get service configuration
    const { data: serviceConfig, error: configError } = await supabase
      .from('api_services')
      .select('*')
      .eq('service_name', service)
      .single() as { data: ApiServiceConfig | null, error: any };

    if (configError || !serviceConfig) {
      throw new Error(`Service ${service} not found or not configured`);
    }

    if (!serviceConfig.is_enabled) {
      throw new Error(`Service ${service} is currently disabled`);
    }

    // Check rate limiting
    const currentMinute = new Date();
    currentMinute.setSeconds(0, 0);
    const windowStart = currentMinute.toISOString();

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('api_rate_limits')
      .select('requests_count')
      .eq('service_name', service)
      .eq('user_id', user.id)
      .eq('window_start', windowStart)
      .single();

    if (!rateLimitError && rateLimitData) {
      if (rateLimitData.requests_count >= serviceConfig.rate_limit_per_minute) {
        throw new Error(`Rate limit exceeded for ${service}. Try again in a minute.`);
      }
      
      // Increment request count
      await supabase
        .from('api_rate_limits')
        .update({ requests_count: rateLimitData.requests_count + 1 })
        .eq('service_name', service)
        .eq('user_id', user.id)
        .eq('window_start', windowStart);
    } else {
      // Create new rate limit entry
      await supabase
        .from('api_rate_limits')
        .insert({
          service_name: service,
          user_id: user.id,
          window_start: windowStart,
          requests_count: 1
        });
    }

    // Generate cache key
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

    // Check cache first
    const { data: cachedData } = await supabase
      .from('widget_cache')
      .select('data, expires_at')
      .eq('user_id', user.id)
      .eq('widget_type', service)
      .eq('cache_key', cacheKey)
      .gte('expires_at', new Date().toISOString())
      .single() as { data: CacheEntry | null };

    if (cachedData) {
      console.log(`Cache hit for ${service} - ${endpoint}`);
      return new Response(JSON.stringify({
        success: true,
        data: cachedData.data,
        cached: true,
        service,
        endpoint
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get API key for the service (stored in Supabase secrets)
    let apiKeyName = `${service.toUpperCase()}_API_KEY`;
    
    // Handle specific service API key mappings
    if (service === 'weather') {
      apiKeyName = 'OPENWEATHERMAP_API_KEY';
    }
    
    const apiKey = Deno.env.get(apiKeyName);

    if (!apiKey && service !== 'crypto') { // CoinGecko API doesn't require key for basic calls
      throw new Error(`API key not configured for ${service}`);
    }

    // Build the full URL
    let fullUrl = `${serviceConfig.base_url}${endpoint}`;
    const urlParams = new URLSearchParams();

    // Add API key to params based on service
    if (apiKey) {
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
    }

    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, String(value));
    });

    if (urlParams.toString()) {
      fullUrl += `?${urlParams.toString()}`;
    }

    console.log(`Making API request to: ${fullUrl}`);

    // Make the API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), serviceConfig.timeout_seconds * 1000);

    const startTime = Date.now();
    let apiResponse;
    let responseData;

    try {
      apiResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'InfoWall Dashboard/1.0',
        },
        signal: controller.signal,
      });

      responseData = await apiResponse.json();
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Log the error
      await supabase.from('api_error_logs').insert({
        service_name: service,
        user_id: user.id,
        endpoint,
        error_type: 'API_REQUEST_FAILED',
        error_message: error.message,
        request_payload: { params, fullUrl },
      });

      throw new Error(`API request failed: ${error.message}`);
    }

    const responseTime = Date.now() - startTime;

    // Log health status
    await supabase.from('api_health_logs').insert({
      service_name: service,
      endpoint,
      status_code: apiResponse.status,
      response_time_ms: responseTime,
      is_healthy: apiResponse.ok,
      error_message: apiResponse.ok ? null : `HTTP ${apiResponse.status}`,
    });

    if (!apiResponse.ok) {
      // Log the error
      await supabase.from('api_error_logs').insert({
        service_name: service,
        user_id: user.id,
        endpoint,
        error_type: 'API_ERROR_RESPONSE',
        error_message: `HTTP ${apiResponse.status}`,
        request_payload: { params, fullUrl },
        response_payload: responseData,
      });

      throw new Error(`API returned error: ${apiResponse.status} - ${responseData?.message || 'Unknown error'}`);
    }

    // Cache the successful response
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + serviceConfig.cache_duration_minutes);

    await supabase.from('widget_cache').upsert({
      user_id: user.id,
      widget_type: service,
      cache_key: cacheKey,
      data: responseData,
      expires_at: expiresAt.toISOString(),
    });

    console.log(`Successful API response for ${service} - ${endpoint} (${responseTime}ms)`);

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      cached: false,
      service,
      endpoint,
      response_time_ms: responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-proxy function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: error.message.includes('Rate limit') ? 429 : 
             error.message.includes('not found') ? 404 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});