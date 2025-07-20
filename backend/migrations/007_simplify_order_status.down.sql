-- Rollback order status simplification
-- Drop simplified enum
DROP TYPE IF EXISTS order_status CASCADE;

-- Recreate original order status enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- Chờ xác nhận
    'confirmed',    -- Đã xác nhận
    'preparing',    -- Đang chuẩn bị
    'ready',        -- Sẵn sàng
    'assigned',     -- Đã phân công
    'picked_up',    -- Đã nhận hàng
    'on_way',       -- Đang giao hàng
    'delivered',    -- Đã giao hàng
    'completed',    -- Hoàn thành
    'cancelled'     -- Đã hủy
);

-- Note: This migration will reset all orders to 'pending' status
-- as we cannot reliably map back the simplified statuses
UPDATE orders SET status = 'pending' WHERE status IN ('pending', 'processing', 'completed');
UPDATE orders SET status = 'cancelled' WHERE status = 'cancelled';

-- Reset order_status_history
UPDATE order_status_history SET status = 'pending' WHERE status IN ('pending', 'processing', 'completed');
UPDATE order_status_history SET status = 'cancelled' WHERE status = 'cancelled';
UPDATE order_status_history SET previous_status = 'pending' WHERE previous_status IN ('pending', 'processing', 'completed');
UPDATE order_status_history SET previous_status = 'cancelled' WHERE previous_status = 'cancelled'; 