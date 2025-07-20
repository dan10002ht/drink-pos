package model

import (
	"time"
)

type Ingredient struct {
	ID        string    `json:"-" db:"id"`
	PublicID  string    `json:"id" db:"public_id"`
	Name      string    `json:"name" db:"name"`
	UnitPrice float64   `json:"unit_price" db:"unit_price"`
	Unit      string    `json:"unit" db:"unit"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateIngredientRequest struct {
	Name      string  `json:"name" validate:"required,max=200"`
	UnitPrice float64 `json:"unit_price" validate:"required,gt=0"`
	Unit      string  `json:"unit" validate:"required,max=50"`
}

type UpdateIngredientRequest struct {
	Name      string  `json:"name" validate:"required,max=200"`
	UnitPrice float64 `json:"unit_price" validate:"required,gt=0"`
	Unit      string  `json:"unit" validate:"required,max=50"`
}

type VariantIngredient struct {
	ID           string    `json:"-" db:"id"`
	VariantID    string    `json:"-" db:"variant_id"`
	IngredientID string    `json:"-" db:"ingredient_id"`
	Quantity     float64   `json:"quantity" db:"quantity"`
	Ingredient   Ingredient `json:"ingredient" db:"ingredient"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type CreateVariantIngredientRequest struct {
	IngredientID string  `json:"ingredient_id" validate:"required"`
	Quantity     float64 `json:"quantity" validate:"required,gt=0"`
} 