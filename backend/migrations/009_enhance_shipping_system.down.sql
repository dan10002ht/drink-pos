-- 009_enhance_shipping_system.down.sql

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_order_delivery_status ON delivery_orders;
DROP TRIGGER IF EXISTS trigger_generate_delivery_number ON delivery_orders;

-- Drop functions
DROP FUNCTION IF EXISTS update_order_delivery_status();
DROP FUNCTION IF EXISTS generate_delivery_number();

-- Drop sequences
DROP SEQUENCE IF EXISTS delivery_number_seq;

-- Drop indexes
DROP INDEX IF EXISTS idx_orders_delivery_status;
DROP INDEX IF EXISTS idx_delivery_order_items_order_item_id;
DROP INDEX IF EXISTS idx_delivery_order_items_delivery_order_id;
DROP INDEX IF EXISTS idx_delivery_orders_delivery_number;
DROP INDEX IF EXISTS idx_delivery_orders_status;
DROP INDEX IF EXISTS idx_delivery_orders_shipper_id;
DROP INDEX IF EXISTS idx_delivery_orders_order_id;
DROP INDEX IF EXISTS idx_delivery_orders_public_id;

-- Drop tables
DROP TABLE IF EXISTS delivery_order_items;
DROP TABLE IF EXISTS delivery_orders;

-- Remove columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_notes;
ALTER TABLE orders DROP COLUMN IF EXISTS actual_delivery_time;
ALTER TABLE orders DROP COLUMN IF EXISTS estimated_delivery_time;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_status;

-- Drop enum types
DROP TYPE IF EXISTS delivery_status;

-- Note: Cannot remove 'ready_for_delivery' from order_status enum in PostgreSQL
-- This would require recreating the enum type 