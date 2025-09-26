import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API Keys
const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

interface TrafficIncident {
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
}

interface MetroAlert {
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
}

// Fetch Houston Metro alerts
async function fetchMetroAlerts(): Promise<MetroAlert[]> {
  try {
    console.log('Fetching Houston Metro alerts...');
    
    // Houston Metro doesn't have a public API, so we'll simulate some alerts for now
    // In production, you would scrape their website or find alternative data sources
    const mockAlerts: MetroAlert[] = [
      {
        alert_type: 'delay',
        title: 'Red Line: Minor Delays',
        description: 'Red Line experiencing 5-10 minute delays due to signal issues near Downtown Transit Center.',
        affected_routes: ['Red Line'],
        severity: 'warning',
        start_time: new Date().toISOString(),
        status: 'active',
        source: 'metro_simulation',
        external_id: 'metro_001'
      }
    ];
    
    console.log(`Found ${mockAlerts.length} Metro alerts (simulated)`);
    return mockAlerts;
  } catch (error) {
    console.error('Error fetching Metro alerts:', error);
    return [];
  }
}

// Fetch traffic incidents from Google Maps
async function fetchGoogleTrafficIncidents(): Promise<TrafficIncident[]> {
  if (!googleMapsApiKey) {
    console.log('Google Maps API key not configured, skipping traffic incidents');
    return [];
  }

  try {
    console.log('Fetching Google Maps traffic data...');
    
    // Google Maps doesn't have a direct traffic incidents API
    // We'll use Places API to find points of interest and simulate incidents
    // In production, you'd use services like TomTom, Here Maps, or Mapbox for incidents
    
    const houstonCoordinates = { lat: 29.7604, lng: -95.3698 };
    const radius = 50000; // 50km radius
    
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${houstonCoordinates.lat},${houstonCoordinates.lng}&radius=${radius}&type=transit_station&key=${googleMapsApiKey}`;
    
    const response = await fetch(placesUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${data.error_message || response.statusText}`);
    }

    // For now, create simulated traffic incidents based on major highways
    const mockIncidents: TrafficIncident[] = [
      {
        title: 'I-45 South: Construction Lane Closure',
        description: 'Right lane closed on I-45 South near Almeda Road. Expect delays.',
        severity: 'medium',
        latitude: 29.7372,
        longitude: -95.3429,
        highway_road: 'I-45 South',
        status: 'active',
        source: 'google_simulation',
        external_id: 'traffic_001'
      },
      {
        title: 'US-59/I-69: Heavy Traffic',
        description: 'Heavy congestion on US-59/I-69 Southwest Freeway near Galleria area.',
        severity: 'high',
        latitude: 29.7372,
        longitude: -95.4618,
        highway_road: 'US-59/I-69',
        status: 'active',
        source: 'google_simulation',
        external_id: 'traffic_002'
      },
      {
        title: 'I-610 West Loop: Accident Cleared',
        description: 'Multi-vehicle accident on I-610 West Loop has been cleared. Traffic normalizing.',
        severity: 'low',
        latitude: 29.7849,
        longitude: -95.4618,
        highway_road: 'I-610 West Loop',
        status: 'resolved',
        source: 'google_simulation',
        external_id: 'traffic_003'
      }
    ];
    
    console.log(`Found ${mockIncidents.length} traffic incidents (simulated)`);
    return mockIncidents;
  } catch (error) {
    console.error('Error fetching Google traffic data:', error);
    return [];
  }
}

// Store traffic incidents in database
async function storeTrafficIncidents(incidents: TrafficIncident[]) {
  if (incidents.length === 0) return;

  try {
    console.log(`Storing ${incidents.length} traffic incidents...`);
    
    for (const incident of incidents) {
      // Check if incident already exists
      const { data: existing } = await supabase
        .from('houston_traffic')
        .select('id')
        .eq('external_id', incident.external_id)
        .eq('source', incident.source)
        .single();

      if (existing) {
        // Update existing incident
        const { error } = await supabase
          .from('houston_traffic')
          .update({
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            status: incident.status,
            end_time: incident.end_time,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating traffic incident:', error);
        } else {
          console.log(`Updated traffic incident: ${incident.title}`);
        }
      } else {
        // Insert new incident
        const { error } = await supabase
          .from('houston_traffic')
          .insert({
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            latitude: incident.latitude,
            longitude: incident.longitude,
            highway_road: incident.highway_road,
            status: incident.status,
            start_time: incident.start_time,
            end_time: incident.end_time,
            source: incident.source,
            external_id: incident.external_id
          });

        if (error) {
          console.error('Error inserting traffic incident:', error);
        } else {
          console.log(`Inserted new traffic incident: ${incident.title}`);
        }
      }
    }
  } catch (error) {
    console.error('Error storing traffic incidents:', error);
  }
}

// Store metro alerts in database
async function storeMetroAlerts(alerts: MetroAlert[]) {
  if (alerts.length === 0) return;

  try {
    console.log(`Storing ${alerts.length} Metro alerts...`);
    
    for (const alert of alerts) {
      // Check if alert already exists
      const { data: existing } = await supabase
        .from('houston_metro_updates')
        .select('id')
        .eq('external_id', alert.external_id)
        .eq('source', alert.source)
        .single();

      if (existing) {
        // Update existing alert
        const { error } = await supabase
          .from('houston_metro_updates')
          .update({
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            status: alert.status,
            end_time: alert.end_time,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating Metro alert:', error);
        } else {
          console.log(`Updated Metro alert: ${alert.title}`);
        }
      } else {
        // Insert new alert
        const { error } = await supabase
          .from('houston_metro_updates')
          .insert({
            alert_type: alert.alert_type,
            title: alert.title,
            description: alert.description,
            affected_routes: alert.affected_routes,
            severity: alert.severity,
            start_time: alert.start_time,
            end_time: alert.end_time,
            status: alert.status,
            source: alert.source,
            external_id: alert.external_id
          });

        if (error) {
          console.error('Error inserting Metro alert:', error);
        } else {
          console.log(`Inserted new Metro alert: ${alert.title}`);
        }
      }
    }
  } catch (error) {
    console.error('Error storing Metro alerts:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'fetch';

    console.log(`Houston Traffic API called with action: ${action}`);

    if (action === 'fetch') {
      // Fetch traffic data from all sources
      const [trafficIncidents, metroAlerts] = await Promise.all([
        fetchGoogleTrafficIncidents(),
        fetchMetroAlerts()
      ]);

      // Store data in database
      await Promise.all([
        storeTrafficIncidents(trafficIncidents),
        storeMetroAlerts(metroAlerts)
      ]);

      return new Response(JSON.stringify({
        success: true,
        message: 'Houston traffic data updated successfully',
        data: {
          traffic_incidents: trafficIncidents.length,
          metro_alerts: metroAlerts.length,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get-traffic') {
      // Return current traffic incidents
      const { data: traffic, error: trafficError } = await supabase
        .from('houston_traffic')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (trafficError) {
        throw new Error(`Database error: ${trafficError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        data: traffic || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get-metro') {
      // Return current metro alerts
      const { data: metro, error: metroError } = await supabase
        .from('houston_metro_updates')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (metroError) {
        throw new Error(`Database error: ${metroError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        data: metro || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action. Use: fetch, get-traffic, or get-metro'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in houston-traffic function:', errorMessage);
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});