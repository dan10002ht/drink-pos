-- 001_create_enums.up.sql

-- Create order_status enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- Chờ xác nhận
    'processing',   -- Đang chuẩn bị
    'completed',    -- Đã hoàn thành
    'ready_for_delivery', -- Sẵn sàng giao hàng
    'cancelled'     -- Đã hủy
);

-- Create discount_type enum
CREATE TYPE discount_type AS ENUM (
    'percentage',   -- Giảm theo phần trăm
    'fixed_amount'  -- Giảm theo số tiền cố định
);

-- Create delivery_status enum
CREATE TYPE delivery_status AS ENUM (
    'pending',           -- Chờ giao hàng
    'assigned',          -- Đã assign shipper
    'picked_up',         -- Shipper đã nhận hàng
    'in_transit',        -- Đang giao hàng
    'delivered',         -- Đã giao hàng thành công
    'failed',            -- Giao hàng thất bại
    'cancelled'          -- Đã hủy giao hàng
); 