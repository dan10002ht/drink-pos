-- 005_create_ingredients_table.up.sql

CREATE TABLE IF NOT EXISTS ingredients (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingredients_public_id ON ingredients(public_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name); 