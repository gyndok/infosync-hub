-- Create API service configurations table
CREATE TABLE public.api_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  cache_duration_minutes INTEGER DEFAULT 30,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API health monitoring table
CREATE TABLE public.api_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  is_healthy BOOLEAN DEFAULT true,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate limiting tracking table
CREATE TABLE public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_name, user_id, window_start)
);

-- Create API error logs table
CREATE TABLE public.api_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.api_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_services (admin only for now)
CREATE POLICY "Anyone can view API services" 
ON public.api_services 
FOR SELECT 
USING (true);

-- Create RLS policies for api_health_logs (read-only for authenticated users)
CREATE POLICY "Authenticated users can view health logs" 
ON public.api_health_logs 
FOR SELECT 
TO authenticated
USING (true);

-- Create RLS policies for api_rate_limits (users can view their own)
CREATE POLICY "Users can view their own rate limits" 
ON public.api_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create RLS policies for api_error_logs (users can view their own errors)
CREATE POLICY "Users can view their own error logs" 
ON public.api_error_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_api_services_updated_at
BEFORE UPDATE ON public.api_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default API service configurations
INSERT INTO public.api_services (service_name, base_url, rate_limit_per_minute, cache_duration_minutes) VALUES
('news', 'https://newsapi.org/v2', 100, 15),
('weather', 'https://api.openweathermap.org/data/2.5', 60, 10),
('finance', 'https://api.polygon.io/v2', 50, 5),
('sports', 'https://api.the-odds-api.com/v4', 30, 30),
('crypto', 'https://api.coingecko.com/api/v3', 50, 5);

-- Create function to clean up old cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.widget_cache 
  WHERE expires_at < now();
  
  DELETE FROM public.api_rate_limits 
  WHERE window_start < (now() - interval '1 hour');
  
  DELETE FROM public.api_health_logs 
  WHERE checked_at < (now() - interval '7 days');
  
  DELETE FROM public.api_error_logs 
  WHERE created_at < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;