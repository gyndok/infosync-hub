-- Add TheSportsDB service to api_services
INSERT INTO api_services (service_name, base_url, is_enabled, rate_limit_per_minute, cache_duration_minutes, timeout_seconds)
SELECT 'thesportsdb', 'https://www.thesportsdb.com/api/v1/json/3', true, 50, 5, 30
WHERE NOT EXISTS (
  SELECT 1 FROM api_services WHERE service_name = 'thesportsdb'
);