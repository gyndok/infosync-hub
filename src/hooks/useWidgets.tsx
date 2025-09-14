import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserWidget {
  id: string;
  user_id: string;
  widget_type:
    | "news"
    | "weather"
    | "finance"
    | "sports"
    | "analytics"
    | "major_indices"
    | "stock_watchlist"
    | "cryptocurrency";
  position: number;
  size: "small" | "medium" | "large";
  configuration: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface WidgetCache {
  id: string;
  user_id: string;
  widget_type: string;
  cache_key: string;
  data: Record<string, any>;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export const useWidgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const widgetsQuery = useQuery({
    queryKey: ["user-widgets", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_widgets")
        .select("*")
        .eq("user_id", user.id)
        .order("position");

      if (error) throw error;
      return data as UserWidget[];
    },
    enabled: !!user,
  });

  const addWidgetMutation = useMutation({
    mutationFn: async (
      widget: Omit<UserWidget, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_widgets")
        .insert({
          ...widget,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-widgets", user?.id] });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<UserWidget> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_widgets")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-widgets", user?.id] });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_widgets")
        .delete()
        .eq("id", widgetId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-widgets", user?.id] });
    },
  });

  const getCachedData = async (widgetType: string, cacheKey: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("widget_cache")
      .select("*")
      .eq("user_id", user.id)
      .eq("widget_type", widgetType)
      .eq("cache_key", cacheKey)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error) return null;
    return data as WidgetCache;
  };

  const setCachedData = async (
    widgetType: string,
    cacheKey: string,
    data: Record<string, any>,
    expiresInMinutes: number = 30,
  ) => {
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    await supabase.from("widget_cache").upsert({
      user_id: user.id,
      widget_type: widgetType,
      cache_key: cacheKey,
      data,
      expires_at: expiresAt.toISOString(),
    });
  };

  return {
    widgets: widgetsQuery.data || [],
    isLoading: widgetsQuery.isLoading,
    error: widgetsQuery.error,
    addWidget: addWidgetMutation.mutate,
    updateWidget: updateWidgetMutation.mutate,
    deleteWidget: deleteWidgetMutation.mutate,
    isUpdating:
      addWidgetMutation.isPending ||
      updateWidgetMutation.isPending ||
      deleteWidgetMutation.isPending,
    getCachedData,
    setCachedData,
  };
};
