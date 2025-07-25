package model

import (
	"time"
)

type Variant struct {
	ID          int64               `json:"-" db:"id"`
	PublicID    string              `json:"id" db:"public_id"`
	ProductID   int64               `json:"-" db:"product_id"`
	Name        string              `json:"name" db:"name"`
	Description string              `json:"description" db:"description"`
	PrivateNote string              `json:"private_note" db:"private_note"`
	Price       float64             `json:"price" db:"price"`
	CreatedAt   time.Time           `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at" db:"updated_at"`
	Ingredients []VariantIngredient `json:"ingredients,omitempty"`
} 