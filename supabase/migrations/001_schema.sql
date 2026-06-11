-- poc3 schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('admin', 'sales');
CREATE TYPE inventory_action_type AS ENUM ('SALE', 'STOCK_ADDED', 'MANUAL_ADJUSTMENT');

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) BETWEEN 2 AND 80),
  whatsapp_number TEXT NOT NULL CHECK (char_length(whatsapp_number) BETWEEN 8 AND 20),
  logo_url TEXT,
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE CHECK (char_length(phone) BETWEEN 8 AND 20),
  name TEXT CHECK (name IS NULL OR char_length(name) <= 120),
  role user_role NOT NULL DEFAULT 'admin',
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, name)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  image_url TEXT,
  price_text TEXT NOT NULL DEFAULT 'Contact for Price' CHECK (char_length(price_text) <= 80),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  action_type inventory_action_type NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE otp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_categories_business ON categories(business_id);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_timestamp ON inventory_logs(timestamp DESC);
CREATE INDEX idx_otp_requests_phone ON otp_requests(phone, expires_at);

CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Public view: never exposes stock_quantity
CREATE VIEW public_products AS
SELECT
  p.id,
  p.business_id,
  p.category_id,
  p.name,
  p.description,
  p.image_url,
  p.price_text,
  p.active,
  p.created_at,
  p.updated_at
FROM products p
WHERE p.active = true;

CREATE VIEW public_businesses AS
SELECT
  b.id,
  b.name,
  b.slug,
  b.whatsapp_number,
  b.logo_url,
  b.description,
  b.created_at
FROM businesses b;
