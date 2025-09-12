-- Add Yahoo Finance service to api_services
INSERT INTO api_services (service_name, base_url, is_enabled, rate_limit_per_minute, cache_duration_minutes, timeout_seconds)
SELECT 'yahoo_finance', 'https://query1.finance.yahoo.com/v8/finance', true, 100, 1, 30
WHERE NOT EXISTS (
  SELECT 1 FROM api_services WHERE service_name = 'yahoo_finance'
);