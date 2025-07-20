CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS variant_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(variant_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_ingredients_variant_id ON variant_ingredients(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_ingredients_ingredient_id ON variant_ingredients(ingredient_id); 