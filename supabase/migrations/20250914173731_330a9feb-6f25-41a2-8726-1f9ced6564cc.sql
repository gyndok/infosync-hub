-- Add MLB API service configuration
INSERT INTO api_services (
  service_name, 
  base_url, 
  is_enabled, 
  rate_limit_per_minute, 
  cache_duration_minutes, 
  timeout_seconds
) VALUES (
  'mlb',
  'https://statsapi.mlb.com/api/v1',
  true,
  60,
  5,
  30
) ON CONFLICT (service_name) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  is_enabled = EXCLUDED.is_enabled,
  rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
  cache_duration_minutes = EXCLUDED.cache_duration_minutes,
  timeout_seconds = EXCLUDED.timeout_seconds;