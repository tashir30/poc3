-- Faster public catalog product listing
CREATE INDEX IF NOT EXISTS idx_products_business_active
  ON products (business_id, active);
