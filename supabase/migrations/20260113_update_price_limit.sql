-- UPDATE PRICE LIMIT FOR PREMIUM SERVICES
-- Remove price restrictions to allow free services and premium pricing

-- Drop the old constraint
ALTER TABLE barber_profiles
DROP CONSTRAINT IF EXISTS barber_profiles_base_price_check;

-- Add new constraint allowing $0 to $500
ALTER TABLE barber_profiles
ADD CONSTRAINT barber_profiles_base_price_check
CHECK (base_price BETWEEN 0 AND 500);
