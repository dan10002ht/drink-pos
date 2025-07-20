-- Remove shipper_id column from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS shipper_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_orders_shipper_id;
DROP INDEX IF EXISTS idx_shippers_is_active;
DROP INDEX IF EXISTS idx_shippers_phone;
DROP INDEX IF EXISTS idx_shippers_public_id;

-- Drop shippers table
DROP TABLE IF EXISTS shippers; 