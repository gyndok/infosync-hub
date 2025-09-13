-- Houston Traffic Table for real-time traffic incidents and conditions
CREATE TABLE public.houston_traffic (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  highway_road TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'planned')) DEFAULT 'active',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT, -- For tracking external API IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Events Table for concerts, festivals, community events
CREATE TABLE public.houston_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  category TEXT NOT NULL CHECK (category IN ('concert', 'festival', 'sports', 'theater', 'community', 'business', 'other')),
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  ticket_url TEXT,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Restaurants Table for restaurant data and reviews
CREATE TABLE public.houston_restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  cuisine_type TEXT,
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 4), -- 1-4 dollar signs
  rating DECIMAL(3, 2) CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  hours JSONB, -- Store opening hours as JSON
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  is_new_opening BOOLEAN DEFAULT false,
  opening_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Real Estate Table for market trends and listings
CREATE TABLE public.houston_real_estate (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  address TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  property_type TEXT CHECK (property_type IN ('house', 'condo', 'townhouse', 'apartment', 'land', 'commercial')),
  neighborhood TEXT,
  listing_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'sold', 'rented', 'withdrawn')) DEFAULT 'active',
  image_url TEXT,
  listing_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Business News Table for startup and corporate news
CREATE TABLE public.houston_business_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  company_name TEXT,
  industry TEXT,
  news_type TEXT CHECK (news_type IN ('funding', 'acquisition', 'ipo', 'expansion', 'closure', 'hiring', 'partnership', 'other')),
  published_date TIMESTAMP WITH TIME ZONE,
  source_name TEXT,
  source_url TEXT,
  image_url TEXT,
  tags TEXT[], -- Array of tags for categorization
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Metro Updates Table for public transportation alerts
CREATE TABLE public.houston_metro_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('service_disruption', 'delay', 'route_change', 'maintenance', 'weather', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  affected_routes TEXT[], -- Array of route names/numbers
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'severe')) DEFAULT 'info',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'planned')) DEFAULT 'active',
  source TEXT NOT NULL DEFAULT 'metro',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Houston Construction Table for construction alerts and road closures
CREATE TABLE public.houston_construction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  affected_roads TEXT[], -- Array of affected road names
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'suspended')) DEFAULT 'planned',
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source TEXT NOT NULL DEFAULT 'txdot',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.houston_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_business_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_metro_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houston_construction ENABLE ROW LEVEL SECURITY;

-- Create public read policies (these are public data sources)
CREATE POLICY "Everyone can view traffic data" ON public.houston_traffic FOR SELECT USING (true);
CREATE POLICY "Everyone can view events" ON public.houston_events FOR SELECT USING (true);
CREATE POLICY "Everyone can view restaurants" ON public.houston_restaurants FOR SELECT USING (true);
CREATE POLICY "Everyone can view real estate listings" ON public.houston_real_estate FOR SELECT USING (true);
CREATE POLICY "Everyone can view business news" ON public.houston_business_news FOR SELECT USING (true);
CREATE POLICY "Everyone can view metro updates" ON public.houston_metro_updates FOR SELECT USING (true);
CREATE POLICY "Everyone can view construction info" ON public.houston_construction FOR SELECT USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_houston_traffic_updated_at
  BEFORE UPDATE ON public.houston_traffic
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_events_updated_at
  BEFORE UPDATE ON public.houston_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_restaurants_updated_at
  BEFORE UPDATE ON public.houston_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_real_estate_updated_at
  BEFORE UPDATE ON public.houston_real_estate
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_business_news_updated_at
  BEFORE UPDATE ON public.houston_business_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_metro_updates_updated_at
  BEFORE UPDATE ON public.houston_metro_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houston_construction_updated_at
  BEFORE UPDATE ON public.houston_construction
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_houston_traffic_status_severity ON public.houston_traffic(status, severity);
CREATE INDEX idx_houston_traffic_location ON public.houston_traffic(latitude, longitude);
CREATE INDEX idx_houston_traffic_created_at ON public.houston_traffic(created_at DESC);

CREATE INDEX idx_houston_events_date_category ON public.houston_events(event_date, category);
CREATE INDEX idx_houston_events_created_at ON public.houston_events(created_at DESC);

CREATE INDEX idx_houston_restaurants_cuisine_rating ON public.houston_restaurants(cuisine_type, rating DESC);
CREATE INDEX idx_houston_restaurants_location ON public.houston_restaurants(latitude, longitude);
CREATE INDEX idx_houston_restaurants_new_opening ON public.houston_restaurants(is_new_opening, opening_date DESC);

CREATE INDEX idx_houston_real_estate_type_status ON public.houston_real_estate(listing_type, status);
CREATE INDEX idx_houston_real_estate_price ON public.houston_real_estate(price);
CREATE INDEX idx_houston_real_estate_neighborhood ON public.houston_real_estate(neighborhood);
CREATE INDEX idx_houston_real_estate_location ON public.houston_real_estate(latitude, longitude);

CREATE INDEX idx_houston_business_news_published ON public.houston_business_news(published_date DESC);
CREATE INDEX idx_houston_business_news_company ON public.houston_business_news(company_name);
CREATE INDEX idx_houston_business_news_industry ON public.houston_business_news(industry);

CREATE INDEX idx_houston_metro_status_severity ON public.houston_metro_updates(status, severity);
CREATE INDEX idx_houston_metro_routes ON public.houston_metro_updates USING GIN(affected_routes);

CREATE INDEX idx_houston_construction_status_impact ON public.houston_construction(status, impact_level);
CREATE INDEX idx_houston_construction_dates ON public.houston_construction(start_date, end_date);
CREATE INDEX idx_houston_construction_roads ON public.houston_construction USING GIN(affected_roads);