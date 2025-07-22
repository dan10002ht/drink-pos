-- Create shippers table
CREATE TABLE IF NOT EXISTS shippers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shippers_public_id ON shippers(public_id);
CREATE INDEX IF NOT EXISTS idx_shippers_phone ON shippers(phone);
CREATE INDEX IF NOT EXISTS idx_shippers_is_active ON shippers(is_active);

-- Add shipper_id column to orders table for simple assignment
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipper_id UUID REFERENCES shippers(id);
CREATE INDEX IF NOT EXISTS idx_orders_shipper_id ON orders(shipper_id); 