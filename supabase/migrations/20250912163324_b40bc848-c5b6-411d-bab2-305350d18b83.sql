-- Fix the security warning by setting search_path for the cleanup function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;