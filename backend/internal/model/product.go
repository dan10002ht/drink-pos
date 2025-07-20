package model

import (
	"time"
)

type Product struct {
	ID          string    `json:"-" db:"id"`
	PublicID    string    `json:"id" db:"public_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	PrivateNote string    `json:"private_note" db:"private_note"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	Variants    []Variant `json:"variants,omitempty"`
}

type CreateProductRequest struct {
	Name        string                    `json:"name" validate:"required,max=200"`
	Description string                    `json:"description" validate:"max=1000"`
	PrivateNote string                    `json:"private_note" validate:"max=1000"`
	Variants     []CreateVariantRequest   `json:"variants" validate:"required,min=1,dive"`
}

type UpdateProductRequest struct {
	Name        string                    `json:"name" validate:"required,max=200"`
	Description string                    `json:"description" validate:"max=1000"`
	PrivateNote string                    `json:"private_note" validate:"max=1000"`
	Variants     []UpdateVariantRequest   `json:"variants" validate:"required,min=1,dive"`
}

type CreateVariantRequest struct {
	Name        string                           `json:"name" validate:"required,max=100"`
	Description string                           `json:"description" validate:"max=500"`
	PrivateNote string                           `json:"private_note" validate:"max=500"`
	Price       float64                          `json:"price" validate:"required,gt=0"`
	Ingredients []CreateVariantIngredientRequest `json:"ingredients,omitempty"`
}

type UpdateVariantRequest struct {
	ID          string                           `json:"id,omitempty"` // This will be public_id from frontend
	Name        string                           `json:"name" validate:"required,max=100"`
	Description string                           `json:"description" validate:"max=500"`
	PrivateNote string                           `json:"private_note" validate:"max=500"`
	Price       float64                          `json:"price" validate:"required,gt=0"`
	Ingredients []CreateVariantIngredientRequest `json:"ingredients,omitempty"`
} 

type ProductFilter struct {
	Search    string `json:"search"`
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	SortBy    string `json:"sort_by"`
	SortOrder string `json:"sort_order"`
}

type PaginatedProducts struct {
	Products   []*Product `json:"products"`
	Total      int64      `json:"total"`
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	TotalPages int        `json:"total_pages"`
	HasNext    bool       `json:"has_next"`
	HasPrev    bool       `json:"has_prev"`
} 