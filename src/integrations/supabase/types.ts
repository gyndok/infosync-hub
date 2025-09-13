export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_error_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          error_type: string
          id: string
          request_payload: Json | null
          response_payload: Json | null
          service_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          error_type: string
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          service_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          error_type?: string
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          service_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_health_logs: {
        Row: {
          checked_at: string
          endpoint: string
          error_message: string | null
          id: string
          is_healthy: boolean | null
          response_time_ms: number | null
          service_name: string
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          is_healthy?: boolean | null
          response_time_ms?: number | null
          service_name: string
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          is_healthy?: boolean | null
          response_time_ms?: number | null
          service_name?: string
          status_code?: number | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          id: string
          requests_count: number | null
          service_name: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          requests_count?: number | null
          service_name: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          requests_count?: number | null
          service_name?: string
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      api_services: {
        Row: {
          base_url: string
          cache_duration_minutes: number | null
          created_at: string
          id: string
          is_enabled: boolean | null
          rate_limit_per_minute: number | null
          service_name: string
          timeout_seconds: number | null
          updated_at: string
        }
        Insert: {
          base_url: string
          cache_duration_minutes?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          rate_limit_per_minute?: number | null
          service_name: string
          timeout_seconds?: number | null
          updated_at?: string
        }
        Update: {
          base_url?: string
          cache_duration_minutes?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          rate_limit_per_minute?: number | null
          service_name?: string
          timeout_seconds?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      houston_business_news: {
        Row: {
          company_name: string | null
          content: string | null
          created_at: string
          external_id: string | null
          headline: string
          id: string
          image_url: string | null
          industry: string | null
          news_type: string | null
          published_date: string | null
          source_name: string | null
          source_url: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          content?: string | null
          created_at?: string
          external_id?: string | null
          headline: string
          id?: string
          image_url?: string | null
          industry?: string | null
          news_type?: string | null
          published_date?: string | null
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          content?: string | null
          created_at?: string
          external_id?: string | null
          headline?: string
          id?: string
          image_url?: string | null
          industry?: string | null
          news_type?: string | null
          published_date?: string | null
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      houston_construction: {
        Row: {
          affected_roads: string[] | null
          created_at: string
          description: string | null
          end_date: string | null
          external_id: string | null
          id: string
          impact_level: string
          latitude: number | null
          location: string | null
          longitude: number | null
          project_name: string
          source: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          affected_roads?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          id?: string
          impact_level?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          project_name: string
          source?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          affected_roads?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          id?: string
          impact_level?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          project_name?: string
          source?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      houston_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          external_id: string | null
          id: string
          image_url: string | null
          price_max: number | null
          price_min: number | null
          source: string
          ticket_url: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          price_max?: number | null
          price_min?: number | null
          source?: string
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          price_max?: number | null
          price_min?: number | null
          source?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      houston_metro_updates: {
        Row: {
          affected_routes: string[] | null
          alert_type: string
          created_at: string
          description: string | null
          end_time: string | null
          external_id: string | null
          id: string
          severity: string
          source: string
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_routes?: string[] | null
          alert_type: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          severity?: string
          source?: string
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_routes?: string[] | null
          alert_type?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          severity?: string
          source?: string
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      houston_real_estate: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          external_id: string | null
          id: string
          image_url: string | null
          latitude: number | null
          listing_date: string | null
          listing_type: string
          listing_url: string | null
          longitude: number | null
          neighborhood: string | null
          price: number
          property_type: string | null
          source: string
          sqft: number | null
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          listing_date?: string | null
          listing_type: string
          listing_url?: string | null
          longitude?: number | null
          neighborhood?: string | null
          price: number
          property_type?: string | null
          source?: string
          sqft?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          listing_date?: string | null
          listing_type?: string
          listing_url?: string | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number
          property_type?: string | null
          source?: string
          sqft?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      houston_restaurants: {
        Row: {
          address: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          external_id: string | null
          hours: Json | null
          id: string
          image_url: string | null
          is_new_opening: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_date: string | null
          phone: string | null
          price_range: number | null
          rating: number | null
          review_count: number | null
          source: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          external_id?: string | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_new_opening?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_date?: string | null
          phone?: string | null
          price_range?: number | null
          rating?: number | null
          review_count?: number | null
          source?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          external_id?: string | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_new_opening?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_date?: string | null
          phone?: string | null
          price_range?: number | null
          rating?: number | null
          review_count?: number | null
          source?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      houston_traffic: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          external_id: string | null
          highway_road: string | null
          id: string
          latitude: number | null
          longitude: number | null
          severity: string
          source: string
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          highway_road?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          severity: string
          source?: string
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          highway_road?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          severity?: string
          source?: string
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_type: string
          avg_cost_per_unit: number
          created_at: string
          id: string
          name: string
          notes: string | null
          portfolio_id: string
          purchase_date: string | null
          quantity: number
          symbol: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          avg_cost_per_unit?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          portfolio_id: string
          purchase_date?: string | null
          quantity?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          avg_cost_per_unit?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          portfolio_id?: string
          purchase_date?: string | null
          quantity?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_type: string
          asset_type: string
          created_at: string
          current_value: number | null
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          notification_method: string | null
          symbol: string
          target_value: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          asset_type: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          notification_method?: string | null
          symbol: string
          target_value: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          asset_type?: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          notification_method?: string | null
          symbol?: string
          target_value?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_cities: {
        Row: {
          city_name: string
          created_at: string
          id: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city_name: string
          created_at?: string
          id?: string
          timezone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city_name?: string
          created_at?: string
          id?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_refresh_interval: number | null
          clock_settings: Json | null
          created_at: string
          dashboard_layout: Json | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_refresh_interval?: number | null
          clock_settings?: Json | null
          created_at?: string
          dashboard_layout?: Json | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_refresh_interval?: number | null
          clock_settings?: Json | null
          created_at?: string
          dashboard_layout?: Json | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_widgets: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          is_enabled: boolean | null
          position: number | null
          size: string | null
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          size?: string | null
          updated_at?: string
          user_id: string
          widget_type: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          size?: string | null
          updated_at?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: []
      }
      widget_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
          updated_at?: string
          user_id: string
          widget_type: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
