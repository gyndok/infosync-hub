-- Add OpenWeatherMap service configuration
INSERT INTO public.api_services (service_name, base_url, is_enabled, rate_limit_per_minute, cache_duration_minutes, timeout_seconds)
VALUES (
  'weather',
  'https://api.openweathermap.org/data/2.5',
  true,
  60, -- 60 requests per minute (OpenWeatherMap limit is 1000/day for free tier)
  10, -- Cache weather data for 10 minutes
  15  -- 15 second timeout
)
ON CONFLICT (service_name) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  is_enabled = EXCLUDED.is_enabled,
  rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
  cache_duration_minutes = EXCLUDED.cache_duration_minutes,
  timeout_seconds = EXCLUDED.timeout_seconds;