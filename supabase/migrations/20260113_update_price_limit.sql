-- UPDATE PRICE LIMIT FOR PREMIUM SERVICES
-- Remove the $30 price cap to allow premium barber services

-- Drop the old constraint
ALTER TABLE barber_profiles
DROP CONSTRAINT IF EXISTS barber_profiles_base_price_check;

-- Add new constraint with higher limit
ALTER TABLE barber_profiles
ADD CONSTRAINT barber_profiles_base_price_check
CHECK (base_price BETWEEN 10 AND 500);
