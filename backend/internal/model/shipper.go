package model

import (
	"time"

	"github.com/google/uuid"
)

// Shipper represents a delivery person
type Shipper struct {
	ID        int64      `json:"-" db:"id"`
	PublicID  uuid.UUID  `json:"id" db:"public_id"`
	Name      string     `json:"name" db:"name"`
	Phone     string     `json:"phone" db:"phone"`
	Email     *string    `json:"email" db:"email"`
	IsActive  bool       `json:"is_active" db:"is_active"`
	CreatedBy *int64     `json:"created_by" db:"created_by"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// Request/Response structs

// CreateShipperRequest represents request to create shipper
type CreateShipperRequest struct {
	Name     string  `json:"name" validate:"required"`
	Phone    string  `json:"phone" validate:"required"`
	Email    *string `json:"email"`
}

// UpdateShipperRequest represents request to update shipper
type UpdateShipperRequest struct {
	Name     *string `json:"name"`
	Phone    *string `json:"phone"`
	Email    *string `json:"email"`
	IsActive *bool   `json:"is_active"`
}

// ShipperResponse represents shipper response
type ShipperResponse struct {
	Shipper Shipper `json:"shipper"`
}

// ShippersResponse represents shippers response
type ShippersResponse struct {
	Shippers []Shipper `json:"shippers"`
	Total    int       `json:"total"`
	Page     int       `json:"page"`
	Limit    int       `json:"limit"`
	Pages    int       `json:"pages"`
} 