-- Row Level Security policies

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

-- Helper: current user's business_id
CREATE OR REPLACE FUNCTION auth_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Businesses
CREATE POLICY "Public can view businesses via slug lookup"
  ON businesses FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update own business"
  ON businesses FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR business_id = auth_user_business_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert staff profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    auth_user_role() = 'admin'
    AND role = 'sales'
    AND business_id = auth_user_business_id()
  );

CREATE POLICY "Admins can update staff in same business"
  ON profiles FOR UPDATE
  USING (
    auth_user_role() = 'admin'
    AND business_id = auth_user_business_id()
    AND id != auth.uid()
  );

-- Categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (business_id = auth_user_business_id() AND auth_user_role() = 'admin')
  WITH CHECK (business_id = auth_user_business_id() AND auth_user_role() = 'admin');

-- Products
CREATE POLICY "Public can view active products metadata"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (business_id = auth_user_business_id() AND auth_user_role() = 'admin')
  WITH CHECK (business_id = auth_user_business_id() AND auth_user_role() = 'admin');

CREATE POLICY "Sales can view products in business"
  ON products FOR SELECT
  USING (business_id = auth_user_business_id());

CREATE POLICY "Sales can update stock only"
  ON products FOR UPDATE
  USING (business_id = auth_user_business_id() AND auth_user_role() = 'sales')
  WITH CHECK (business_id = auth_user_business_id() AND auth_user_role() = 'sales');

-- Inventory logs
CREATE POLICY "Business members can view logs"
  ON inventory_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products pr
      WHERE pr.id = inventory_logs.product_id
        AND pr.business_id = auth_user_business_id()
    )
  );

CREATE POLICY "Business members can insert logs"
  ON inventory_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM products pr
      WHERE pr.id = inventory_logs.product_id
        AND pr.business_id = auth_user_business_id()
    )
  );

-- OTP requests: service role only (no anon/authenticated policies)

-- Public views
GRANT SELECT ON public_products TO anon, authenticated;
GRANT SELECT ON public_businesses TO anon, authenticated;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users upload to business folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users update own uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
