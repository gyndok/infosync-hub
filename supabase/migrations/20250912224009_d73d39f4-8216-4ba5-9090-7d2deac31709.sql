-- Ensure Finnhub service exists in api_services
INSERT INTO api_services (service_name, base_url, is_enabled, rate_limit_per_minute, cache_duration_minutes, timeout_seconds)
SELECT 'finnhub', 'https://finnhub.io/api/v1', true, 60, 1, 30
WHERE NOT EXISTS (
  SELECT 1 FROM api_services WHERE service_name = 'finnhub'
);
