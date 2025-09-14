import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ApiProxyResponse {
  success: boolean;
  data?: any;
  cached?: boolean;
  service?: string;
  endpoint?: string;
  response_time_ms?: number;
  error?: string;
}

interface ApiRequest {
  service: string;
  endpoint: string;
  params?: Record<string, any>;
}

export const useApiProxy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const makeRequest = async (
    request: ApiRequest,
  ): Promise<ApiProxyResponse> => {
    if (!session) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "api-proxy",
        {
          body: request,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = async (service?: string) => {
    try {
      const params = new URLSearchParams();
      params.append("action", service ? "check-service" : "check-all");
      if (service) {
        params.append("service", service);
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        `health-monitor?${params.toString()}`,
        {
          method: "GET",
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Health check failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getHealthLogs = async (service?: string, limit = 50) => {
    if (!session) {
      throw new Error("User not authenticated");
    }

    try {
      const params = new URLSearchParams();
      params.append("action", "get-logs");
      params.append("limit", limit.toString());
      if (service) {
        params.append("service", service);
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        `health-monitor?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch health logs";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getSecretsStatus = async () => {
    if (!session) {
      throw new Error("User not authenticated");
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "manage-secrets?action=list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch secrets status";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const testApiKey = async (service: string) => {
    if (!session) {
      throw new Error("User not authenticated");
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "manage-secrets",
        {
          body: { service },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "API key test failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    makeRequest,
    getHealthStatus,
    getHealthLogs,
    getSecretsStatus,
    testApiKey,
    loading,
    error,
  };
};
