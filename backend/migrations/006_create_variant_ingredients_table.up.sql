-- 006_create_variant_ingredients_table.up.sql

CREATE TABLE IF NOT EXISTS variant_ingredients (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    ingredient_id BIGINT NOT NULL REFERENCES ingredients(id),
    quantity DECIMAL(10,2) NOT NULL,
    UNIQUE (variant_id, ingredient_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variant_ingredients_variant_id ON variant_ingredients(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_ingredients_ingredient_id ON variant_ingredients(ingredient_id); 