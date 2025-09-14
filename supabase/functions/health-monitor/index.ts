import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApiServiceConfig {
  service_name: string;
  base_url: string;
  is_enabled: boolean;
  timeout_seconds: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "check-all";
    const service = url.searchParams.get("service");

    console.log(`Health monitor action: ${action}`);

    if (action === "check-all") {
      // Get all enabled services
      const { data: services, error: servicesError } = (await supabase
        .from("api_services")
        .select("*")
        .eq("is_enabled", true)) as {
        data: ApiServiceConfig[] | null;
        error: any;
      };

      if (servicesError || !services) {
        throw new Error("Failed to fetch services configuration");
      }

      const healthChecks = await Promise.all(
        services.map(async (serviceConfig) => {
          return await checkServiceHealth(supabase, serviceConfig);
        }),
      );

      // Get recent health summary
      const { data: recentLogs } = await supabase
        .from("api_health_logs")
        .select("service_name, is_healthy, response_time_ms, checked_at")
        .gte(
          "checked_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ) // Last 24 hours
        .order("checked_at", { ascending: false });

      const healthSummary = services.map((serviceConfig) => {
        const serviceLogs =
          recentLogs?.filter(
            (log) => log.service_name === serviceConfig.service_name,
          ) || [];
        const totalRequests = serviceLogs.length;
        const healthyRequests = serviceLogs.filter(
          (log) => log.is_healthy,
        ).length;
        const avgResponseTime =
          serviceLogs.length > 0
            ? Math.round(
                serviceLogs.reduce(
                  (sum, log) => sum + (log.response_time_ms || 0),
                  0,
                ) / serviceLogs.length,
              )
            : 0;

        return {
          service_name: serviceConfig.service_name,
          is_enabled: serviceConfig.is_enabled,
          uptime_percentage:
            totalRequests > 0
              ? Math.round((healthyRequests / totalRequests) * 100)
              : 100,
          avg_response_time_ms: avgResponseTime,
          total_requests_24h: totalRequests,
          last_check: serviceLogs[0]?.checked_at || null,
          current_status:
            healthChecks.find(
              (hc) => hc.service_name === serviceConfig.service_name,
            )?.is_healthy || false,
        };
      });

      return new Response(
        JSON.stringify({
          success: true,
          health_checks: healthChecks,
          summary: healthSummary,
          checked_at: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else if (action === "check-service" && service) {
      // Check specific service
      const { data: serviceConfig, error: configError } = (await supabase
        .from("api_services")
        .select("*")
        .eq("service_name", service)
        .single()) as { data: ApiServiceConfig | null; error: any };

      if (configError || !serviceConfig) {
        throw new Error(`Service ${service} not found`);
      }

      const healthCheck = await checkServiceHealth(supabase, serviceConfig);

      return new Response(
        JSON.stringify({
          success: true,
          health_check: healthCheck,
          checked_at: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else if (action === "get-logs") {
      // Get health logs for dashboard
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid authorization header");
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

      if (authError || !user) {
        throw new Error("Invalid or expired token");
      }

      const limit = parseInt(url.searchParams.get("limit") || "50");
      const serviceFilter = url.searchParams.get("service");

      let query = supabase
        .from("api_health_logs")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(limit);

      if (serviceFilter) {
        query = query.eq("service_name", serviceFilter);
      }

      const { data: logs, error: logsError } = await query;

      if (logsError) {
        throw new Error("Failed to fetch health logs");
      }

      return new Response(
        JSON.stringify({
          success: true,
          logs: logs || [],
          count: logs?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      throw new Error("Invalid action parameter");
    }
  } catch (error) {
    console.error("Error in health-monitor function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function checkServiceHealth(
  supabase: any,
  serviceConfig: ApiServiceConfig,
) {
  const startTime = Date.now();
  let isHealthy = false;
  let statusCode = 0;
  let errorMessage = null;

  try {
    // Define health check endpoints for each service
    const healthEndpoints: Record<string, string> = {
      news: "/everything?q=test&pageSize=1",
      weather: "/weather?q=London",
      finance: "/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02",
      sports: "/sports",
      crypto: "/ping",
    };

    const endpoint = healthEndpoints[serviceConfig.service_name] || "/";
    let fullUrl = `${serviceConfig.base_url}${endpoint}`;

    // Add API keys for services that require them
    const apiKeyName = `${serviceConfig.service_name.toUpperCase()}_API_KEY`;
    const apiKey = Deno.env.get(apiKeyName);

    if (apiKey) {
      const urlParams = new URLSearchParams();
      switch (serviceConfig.service_name) {
        case "news":
          urlParams.append("apiKey", apiKey);
          break;
        case "weather":
          urlParams.append("appid", apiKey);
          break;
        case "finance":
          urlParams.append("apikey", apiKey);
          break;
        case "sports":
          urlParams.append("apiKey", apiKey);
          break;
      }

      if (urlParams.toString()) {
        fullUrl += (fullUrl.includes("?") ? "&" : "?") + urlParams.toString();
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      serviceConfig.timeout_seconds * 1000,
    );

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "User-Agent": "InfoWall Health Monitor/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    statusCode = response.status;
    isHealthy = response.ok;

    if (!response.ok) {
      const errorData = await response.text();
      errorMessage = `HTTP ${response.status}: ${errorData.substring(0, 200)}`;
    }
  } catch (error) {
    errorMessage = error.message;
    isHealthy = false;
  }

  const responseTime = Date.now() - startTime;

  // Log the health check result
  await supabase.from("api_health_logs").insert({
    service_name: serviceConfig.service_name,
    endpoint: "health-check",
    status_code: statusCode,
    response_time_ms: responseTime,
    is_healthy: isHealthy,
    error_message: errorMessage,
  });

  return {
    service_name: serviceConfig.service_name,
    is_healthy: isHealthy,
    status_code: statusCode,
    response_time_ms: responseTime,
    error_message: errorMessage,
    checked_at: new Date().toISOString(),
  };
}
