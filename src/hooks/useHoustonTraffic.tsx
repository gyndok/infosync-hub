import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrafficIncident {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
  highway_road?: string;
  status: 'active' | 'resolved' | 'planned';
  start_time?: string;
  end_time?: string;
  source: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

interface MetroAlert {
  id: string;
  alert_type: 'service_disruption' | 'delay' | 'route_change' | 'maintenance' | 'weather' | 'other';
  title: string;
  description?: string;
  affected_routes?: string[];
  severity: 'info' | 'warning' | 'severe';
  start_time?: string;
  end_time?: string;
  status: 'active' | 'resolved' | 'planned';
  source: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export const useHoustonTraffic = () => {
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>([]);
  const [metroAlerts, setMetroAlerts] = useState<MetroAlert[]>([]);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(true);
  const [isLoadingMetro, setIsLoadingMetro] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch traffic incidents from database
  const fetchTrafficIncidents = async () => {
    try {
      setIsLoadingTraffic(true);
      const { data, error } = await supabase
        .from('houston_traffic')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTrafficIncidents((data || []) as TrafficIncident[]);
    } catch (err) {
      console.error('Error fetching traffic incidents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
    } finally {
      setIsLoadingTraffic(false);
    }
  };

  // Fetch metro alerts from database
  const fetchMetroAlerts = async () => {
    try {
      setIsLoadingMetro(true);
      const { data, error } = await supabase
        .from('houston_metro_updates')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMetroAlerts((data || []) as MetroAlert[]);
    } catch (err) {
      console.error('Error fetching Metro alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Metro data');
    } finally {
      setIsLoadingMetro(false);
    }
  };

  // Refresh data by calling the edge function
  const refreshData = async () => {
    try {
      setError(null);
      console.log('Refreshing Houston traffic data...');

      const { data, error } = await supabase.functions.invoke('houston-traffic', {
        body: { action: 'fetch' }
      });

      if (error) throw error;

      console.log('Traffic data refresh response:', data);
      
      // After successful refresh, fetch updated data from database
      await Promise.all([
        fetchTrafficIncidents(),
        fetchMetroAlerts()
      ]);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing traffic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh traffic data');
    }
  };

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchTrafficIncidents(),
      fetchMetroAlerts()
    ]);
  }, []);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    trafficIncidents,
    metroAlerts,
    isLoadingTraffic,
    isLoadingMetro,
    isLoading: isLoadingTraffic || isLoadingMetro,
    error,
    lastUpdated,
    refreshData,
    refetch: () => Promise.all([
      fetchTrafficIncidents(),
      fetchMetroAlerts()
    ])
  };
};