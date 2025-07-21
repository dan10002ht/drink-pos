-- Simplify order status enum
-- Chuyển đổi dữ liệu về các giá trị mới trước khi đổi enum
UPDATE orders SET status = 'pending' WHERE status IN ('pending', 'confirmed');
UPDATE orders SET status = 'processing' WHERE status IN ('preparing', 'ready');
UPDATE orders SET status = 'completed' WHERE status = 'completed';
UPDATE orders SET status = 'cancelled' WHERE status = 'cancelled';

UPDATE order_status_history SET status = 'pending' WHERE status IN ('pending', 'confirmed');
UPDATE order_status_history SET status = 'processing' WHERE status IN ('preparing', 'ready');
UPDATE order_status_history SET status = 'completed' WHERE status = 'completed';
UPDATE order_status_history SET status = 'cancelled' WHERE status = 'cancelled';

UPDATE order_status_history SET previous_status = 'pending' WHERE previous_status IN ('pending', 'confirmed');
UPDATE order_status_history SET previous_status = 'processing' WHERE previous_status IN ('preparing', 'ready');
UPDATE order_status_history SET previous_status = 'completed' WHERE previous_status = 'completed';
UPDATE order_status_history SET previous_status = 'cancelled' WHERE previous_status = 'cancelled';

-- Drop existing enum and recreate with simplified values
DROP TYPE IF EXISTS order_status CASCADE;

-- Create new simplified order status enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- Chờ xử lý
    'processing',   -- Đang xử lý
    'completed',    -- Đã xử lý
    'cancelled'     -- Đã hủy
); 