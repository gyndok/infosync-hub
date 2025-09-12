-- Update widget_type check constraints to include new finance widget types
ALTER TABLE user_widgets DROP CONSTRAINT user_widgets_widget_type_check;
ALTER TABLE user_widgets ADD CONSTRAINT user_widgets_widget_type_check 
  CHECK (widget_type = ANY (ARRAY['news'::text, 'weather'::text, 'finance'::text, 'sports'::text, 'analytics'::text, 'major_indices'::text, 'stock_watchlist'::text, 'cryptocurrency'::text]));

-- Also update widget_cache table constraint
ALTER TABLE widget_cache DROP CONSTRAINT widget_cache_widget_type_check;
ALTER TABLE widget_cache ADD CONSTRAINT widget_cache_widget_type_check 
  CHECK (widget_type = ANY (ARRAY['news'::text, 'weather'::text, 'finance'::text, 'sports'::text, 'analytics'::text, 'major_indices'::text, 'stock_watchlist'::text, 'cryptocurrency'::text]));

-- Update unique constraint on user_widgets to allow multiple finance widgets per user
ALTER TABLE user_widgets DROP CONSTRAINT user_widgets_user_id_widget_type_key;