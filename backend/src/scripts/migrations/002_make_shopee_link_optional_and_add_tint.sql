-- Migration: Make shopee_link optional and add tint category
-- Date: 2025-01-24
-- Description: This migration makes the shopee_link column nullable and adds 'tint' as a valid product category

-- Make shopee_link nullable
ALTER TABLE products 
  ALTER COLUMN shopee_link DROP NOT NULL;

-- Update existing NULL values to empty string (if any)
UPDATE products 
  SET shopee_link = '' 
  WHERE shopee_link IS NULL;

-- Drop the old category constraint
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_category_check;

-- Add the new category constraint including 'tint'
ALTER TABLE products 
  ADD CONSTRAINT products_category_check 
  CHECK (category IN ('hijab', 'lens', 'lip', 'eyeshadow', 'tint'));

-- Add comment to document the change
COMMENT ON COLUMN products.shopee_link IS 'Optional Shopee product link. Can be empty string or NULL.';