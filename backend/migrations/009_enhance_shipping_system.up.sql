-- 009_enhance_shipping_system.up.sql

-- Create delivery_orders table for split orders
CREATE TABLE IF NOT EXISTS delivery_orders (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shipper_id BIGINT REFERENCES shippers(id),
    delivery_number VARCHAR(20) UNIQUE NOT NULL, -- Format: DEL-YYYYMMDD-001
    status delivery_status NOT NULL DEFAULT 'pending',
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    delivery_notes TEXT,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery_order_items table for items in each delivery
CREATE TABLE IF NOT EXISTS delivery_order_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_order_id BIGINT NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_orders_public_id ON delivery_orders(public_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_order_id ON delivery_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_shipper_id ON delivery_orders(shipper_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_delivery_number ON delivery_orders(delivery_number);

CREATE INDEX IF NOT EXISTS idx_delivery_order_items_delivery_order_id ON delivery_order_items(delivery_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_order_items_order_item_id ON delivery_order_items(order_item_id);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);

-- Create sequence for delivery_number
CREATE SEQUENCE IF NOT EXISTS delivery_number_seq;

-- Function to generate delivery number
CREATE OR REPLACE FUNCTION generate_delivery_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_number IS NULL THEN
        NEW.delivery_number := 'DEL-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                              LPAD(NEXTVAL('delivery_number_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate delivery number
CREATE TRIGGER trigger_generate_delivery_number
    BEFORE INSERT ON delivery_orders
    FOR EACH ROW
    WHEN (NEW.delivery_number IS NULL)
    EXECUTE FUNCTION generate_delivery_number();

-- Function to update order delivery status based on delivery orders
CREATE OR REPLACE FUNCTION update_order_delivery_status()
RETURNS TRIGGER AS $$
DECLARE
    order_delivery_status delivery_status;
BEGIN
    -- Determine overall delivery status based on all delivery orders
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 'pending'::delivery_status
            WHEN COUNT(*) FILTER (WHERE status = 'delivered') = COUNT(*) THEN 'delivered'::delivery_status
            WHEN COUNT(*) FILTER (WHERE status IN ('failed', 'cancelled')) = COUNT(*) THEN 'failed'::delivery_status
            WHEN COUNT(*) FILTER (WHERE status IN ('in_transit', 'picked_up')) > 0 THEN 'in_transit'::delivery_status
            WHEN COUNT(*) FILTER (WHERE status = 'assigned') > 0 THEN 'assigned'::delivery_status
            ELSE 'pending'::delivery_status
        END
    INTO order_delivery_status
    FROM delivery_orders 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update order delivery status
    UPDATE orders 
    SET delivery_status = order_delivery_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order delivery status
CREATE TRIGGER trigger_update_order_delivery_status
    AFTER INSERT OR UPDATE OR DELETE ON delivery_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_delivery_status(); 