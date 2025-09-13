-- Create table for user custom cities/timezones
CREATE TABLE public.user_custom_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, city_name)
);

-- Enable Row Level Security
ALTER TABLE public.user_custom_cities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own custom cities" 
ON public.user_custom_cities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom cities" 
ON public.user_custom_cities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom cities" 
ON public.user_custom_cities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom cities" 
ON public.user_custom_cities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_custom_cities_updated_at
BEFORE UPDATE ON public.user_custom_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();