-- Add clock_settings column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN clock_settings JSONB DEFAULT '{"selectedTimezones": [{"id": "local", "city": "Local Time", "timezone": "America/New_York"}]}'::jsonb;