-- Simplify order status enum
-- Drop existing enum and recreate with simplified values
DROP TYPE IF EXISTS order_status CASCADE;

-- Create new simplified order status enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- Chờ xử lý
    'processing',   -- Đang xử lý
    'completed',    -- Đã xử lý
    'cancelled'     -- Đã hủy
);

-- Update existing orders to use new status values
-- Map old statuses to new ones
UPDATE orders SET status = 'pending' WHERE status IN ('pending', 'confirmed');
UPDATE orders SET status = 'processing' WHERE status IN ('preparing', 'ready', 'assigned', 'picked_up', 'on_way', 'delivered');
UPDATE orders SET status = 'completed' WHERE status = 'completed';
UPDATE orders SET status = 'cancelled' WHERE status = 'cancelled';

-- Update order_status_history table
UPDATE order_status_history SET status = 'pending' WHERE status IN ('pending', 'confirmed');
UPDATE order_status_history SET status = 'processing' WHERE status IN ('preparing', 'ready', 'assigned', 'picked_up', 'on_way', 'delivered');
UPDATE order_status_history SET status = 'completed' WHERE status = 'completed';
UPDATE order_status_history SET status = 'cancelled' WHERE status = 'cancelled';

-- Update previous_status in order_status_history
UPDATE order_status_history SET previous_status = 'pending' WHERE previous_status IN ('pending', 'confirmed');
UPDATE order_status_history SET previous_status = 'processing' WHERE previous_status IN ('preparing', 'ready', 'assigned', 'picked_up', 'on_way', 'delivered');
UPDATE order_status_history SET previous_status = 'completed' WHERE previous_status = 'completed';
UPDATE order_status_history SET previous_status = 'cancelled' WHERE previous_status = 'cancelled'; 