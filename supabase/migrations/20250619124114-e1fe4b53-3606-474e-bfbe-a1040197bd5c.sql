
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profit calculations tracking table
CREATE TABLE public.profit_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  profit_margin DECIMAL(5,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_date DATE DEFAULT CURRENT_DATE
);

-- Create exchange rates table for currency conversion
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code TEXT NOT NULL,
  rate_to_try DECIMAL(10,4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(currency_code)
);

-- Insert default exchange rates
INSERT INTO public.exchange_rates (currency_code, rate_to_try) VALUES
('TRY', 1.0000),
('USD', 32.5000),
('EUR', 35.2000),
('GBP', 41.1000);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calculations" ON public.profit_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON public.profit_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view exchange rates" ON public.exchange_rates
  FOR SELECT TO authenticated USING (true);

-- Create function to get daily profit summary
CREATE OR REPLACE FUNCTION get_daily_profit_summary(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_calculations BIGINT,
  total_profit_amount DECIMAL,
  average_margin DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_calculations,
    SUM(final_price - original_price) as total_profit_amount,
    AVG(profit_margin) as average_margin
  FROM public.profit_calculations 
  WHERE user_id = user_uuid 
    AND calculation_date = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
