-- Add API services for financial data
INSERT INTO public.api_services (service_name, base_url, rate_limit_per_minute, cache_duration_minutes, timeout_seconds) VALUES
('alpha_vantage', 'https://www.alphavantage.co/query', 5, 60, 30),
('finnhub', 'https://finnhub.io/api/v1', 60, 15, 30),
('coingecko', 'https://api.coingecko.com/api/v3', 50, 30, 30);

-- Create user portfolios table
CREATE TABLE public.user_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_portfolios
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for user_portfolios
CREATE POLICY "Users can manage their own portfolios" 
ON public.user_portfolios 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create portfolio holdings table
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.user_portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'etf', 'mutual_fund')),
  quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  avg_cost_per_unit DECIMAL(20, 8) NOT NULL DEFAULT 0,
  purchase_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, symbol, asset_type)
);

-- Enable RLS on portfolio_holdings
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_holdings
CREATE POLICY "Users can manage holdings in their portfolios" 
ON public.portfolio_holdings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_portfolios 
    WHERE id = portfolio_holdings.portfolio_id 
    AND user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_portfolios 
    WHERE id = portfolio_holdings.portfolio_id 
    AND user_id = auth.uid()
  )
);

-- Create price alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'etf', 'mutual_fund')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'change_percent')),
  target_value DECIMAL(20, 8) NOT NULL,
  current_value DECIMAL(20, 8),
  is_triggered BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notification_method TEXT DEFAULT 'in_app' CHECK (notification_method IN ('in_app', 'email', 'both')),
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on price_alerts
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for price_alerts
CREATE POLICY "Users can manage their own price alerts" 
ON public.price_alerts 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_portfolios_updated_at
  BEFORE UPDATE ON public.user_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX idx_portfolio_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_symbol ON public.portfolio_holdings(symbol);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON public.price_alerts(symbol);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;