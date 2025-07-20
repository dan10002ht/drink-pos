-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items;
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS log_order_status_change();
DROP FUNCTION IF EXISTS update_order_total();
DROP FUNCTION IF EXISTS generate_order_number();

-- Drop tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Drop enums
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE; 