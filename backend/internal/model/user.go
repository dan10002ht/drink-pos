package model

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int64     `json:"-" db:"id"` // internal
	PublicID     string    `json:"id" db:"public_id"`
	Username     string    `json:"username" db:"username"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"full_name" db:"full_name"`
	Phone        sql.NullString `json:"phone" db:"phone"`
	Role         string    `json:"role" db:"role"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	IsGuest      bool      `json:"is_guest" db:"is_guest"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type UserStatistics struct {
	TotalOrders   int        `json:"total_orders"`
	TotalSpent    float64    `json:"total_spent"`
	LastOrderDate *time.Time `json:"last_order_date,omitempty"`
}
