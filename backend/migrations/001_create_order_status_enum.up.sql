CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create order status enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- Chờ xác nhận
    'processing',    -- Đang chuẩn bị
    'completed',        -- Sẵn sàng
    'cancelled'     -- Hoàn thành
); 
