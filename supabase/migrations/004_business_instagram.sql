-- Add Instagram profile URL for public catalog social links
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_url TEXT;
