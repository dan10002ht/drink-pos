-- 006_create_variant_ingredients_table.up.sql

CREATE TABLE IF NOT EXISTS variant_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variant_ingredients_variant_id ON variant_ingredients(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_ingredients_ingredient_id ON variant_ingredients(ingredient_id); 