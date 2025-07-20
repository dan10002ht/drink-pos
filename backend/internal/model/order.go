package model

import (
	"time"
)

// Order Status Enum
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"    // Chờ xử lý
	OrderStatusProcessing OrderStatus = "processing" // Đang xử lý
	OrderStatusCompleted OrderStatus = "completed"  // Đã xử lý
	OrderStatusCancelled OrderStatus = "cancelled"  // Đã hủy
)

// Discount Type Enum
type DiscountType string

const (
	DiscountTypePercentage  DiscountType = "percentage"
	DiscountTypeFixedAmount DiscountType = "fixed_amount"
)

// Payment Status Enum
type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusPaid    PaymentStatus = "paid"
	PaymentStatusFailed  PaymentStatus = "failed"
)

// Order Model
type Order struct {
	ID            string        `json:"-" db:"id"`
	PublicID      string        `json:"id" db:"public_id"`
	OrderNumber   string        `json:"order_number" db:"order_number"`
	CustomerName  string        `json:"customer_name" db:"customer_name"`
	CustomerPhone string        `json:"customer_phone" db:"customer_phone"`
	CustomerEmail string        `json:"customer_email" db:"customer_email"`
	Status        OrderStatus   `json:"status" db:"status"`
	Subtotal      float64       `json:"subtotal" db:"subtotal"`
	DiscountAmount float64      `json:"discount_amount" db:"discount_amount"`
	DiscountType  *DiscountType `json:"discount_type" db:"discount_type"`
	DiscountCode  string        `json:"discount_code" db:"discount_code"`
	DiscountNote  string        `json:"discount_note" db:"discount_note"`
	TotalAmount   float64       `json:"total_amount" db:"total_amount"`
	PaymentMethod string        `json:"payment_method" db:"payment_method"`
	PaymentStatus PaymentStatus `json:"payment_status" db:"payment_status"`
	Notes         string        `json:"notes" db:"notes"`
	ShipperID     *string       `json:"shipper_id" db:"shipper_id"`
	CreatedBy     string        `json:"created_by" db:"created_by"`
	UpdatedBy     string        `json:"updated_by" db:"updated_by"`
	CreatedAt     time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at" db:"updated_at"`
	
	// Relations
	Items         []OrderItem   `json:"items,omitempty"`
	StatusHistory []OrderStatusHistory `json:"status_history,omitempty"`
	CreatedByUser *User         `json:"created_by_user,omitempty"`
	UpdatedByUser *User         `json:"updated_by_user,omitempty"`
	Shipper       *Shipper      `json:"shipper,omitempty"`
}

// Order Item Model
type OrderItem struct {
	ID          string    `json:"-" db:"id"`
	OrderID     string    `json:"-" db:"order_id"`
	VariantID   string    `json:"variant_id" db:"variant_id"`
	ProductName string    `json:"product_name" db:"product_name"`
	VariantName string    `json:"variant_name" db:"variant_name"`
	Quantity    int       `json:"quantity" db:"quantity"`
	UnitPrice   float64   `json:"unit_price" db:"unit_price"`
	TotalPrice  float64   `json:"total_price" db:"total_price"`
	Notes       string    `json:"notes" db:"notes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	
	// Relations
	Variant     *Variant `json:"variant,omitempty"`
}

// Order Status History Model
type OrderStatusHistory struct {
	ID            string      `json:"-" db:"id"`
	OrderID       string      `json:"-" db:"order_id"`
	Status        OrderStatus `json:"status" db:"status"`
	PreviousStatus *OrderStatus `json:"previous_status" db:"previous_status"`
	Notes         string      `json:"notes" db:"notes"`
	ChangedBy     string      `json:"changed_by" db:"changed_by"`
	CreatedAt     time.Time   `json:"created_at" db:"created_at"`
	
	// Relations
	ChangedByUser *User `json:"changed_by_user,omitempty"`
}

// Discount Code Model
type DiscountCode struct {
	ID                string        `json:"-" db:"id"`
	PublicID          string        `json:"id" db:"public_id"`
	Code              string        `json:"code" db:"code"`
	Name              string        `json:"name" db:"name"`
	Description       string        `json:"description" db:"description"`
	DiscountType      DiscountType  `json:"discount_type" db:"discount_type"`
	DiscountValue     float64       `json:"discount_value" db:"discount_value"`
	MinOrderAmount    float64       `json:"min_order_amount" db:"min_order_amount"`
	MaxDiscountAmount *float64      `json:"max_discount_amount" db:"max_discount_amount"`
	UsageLimit        *int          `json:"usage_limit" db:"usage_limit"`
	UsedCount         int           `json:"used_count" db:"used_count"`
	IsActive          bool          `json:"is_active" db:"is_active"`
	ValidFrom         time.Time     `json:"valid_from" db:"valid_from"`
	ValidUntil        time.Time     `json:"valid_until" db:"valid_until"`
	CreatedBy         string        `json:"created_by" db:"created_by"`
	CreatedAt         time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at" db:"updated_at"`
	
	// Relations
	CreatedByUser *User `json:"created_by_user,omitempty"`
}

// Request/Response Models

type CreateOrderRequest struct {
	CustomerName  string                    `json:"customer_name" validate:"required,max=100"`
	CustomerPhone string                    `json:"customer_phone" validate:"required,max=20"`
	CustomerEmail string                    `json:"customer_email" validate:"omitempty,email,max=100"`
	Items         []CreateOrderItemRequest  `json:"items" validate:"required,min=1,dive"`
	DiscountCode  string                    `json:"discount_code" validate:"omitempty,max=50"`
	DiscountNote  string                    `json:"discount_note" validate:"omitempty,max=500"`
	PaymentMethod string                    `json:"payment_method" validate:"omitempty,max=50"`
	Notes         string                    `json:"notes" validate:"omitempty,max=1000"`
}

type CreateOrderItemRequest struct {
	VariantID string `json:"variant_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
	Notes     string `json:"notes" validate:"omitempty,max=500"`
}

type UpdateOrderRequest struct {
	CustomerName  string                    `json:"customer_name" validate:"required,max=100"`
	CustomerPhone string                    `json:"customer_phone" validate:"required,max=20"`
	CustomerEmail string                    `json:"customer_email" validate:"omitempty,email,max=100"`
	Items         []UpdateOrderItemRequest  `json:"items" validate:"required,min=1,dive"`
	DiscountCode  string                    `json:"discount_code" validate:"omitempty,max=50"`
	DiscountNote  string                    `json:"discount_note" validate:"omitempty,max=500"`
	PaymentMethod string                    `json:"payment_method" validate:"omitempty,max=50"`
	Notes         string                    `json:"notes" validate:"omitempty,max=1000"`
}

type UpdateOrderItemRequest struct {
	ID        string `json:"id" validate:"omitempty"`
	VariantID string `json:"variant_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
	Notes     string `json:"notes" validate:"omitempty,max=500"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" validate:"required"`
	Notes  string      `json:"notes" validate:"omitempty,max=500"`
}

type CreateDiscountCodeRequest struct {
	Code              string        `json:"code" validate:"required,max=50"`
	Name              string        `json:"name" validate:"required,max=100"`
	Description       string        `json:"description" validate:"omitempty,max=500"`
	DiscountType      DiscountType  `json:"discount_type" validate:"required"`
	DiscountValue     float64       `json:"discount_value" validate:"required,gt=0"`
	MinOrderAmount    float64       `json:"min_order_amount" validate:"gte=0"`
	MaxDiscountAmount *float64      `json:"max_discount_amount" validate:"omitempty,gt=0"`
	UsageLimit        *int          `json:"usage_limit" validate:"omitempty,gt=0"`
	ValidFrom         time.Time     `json:"valid_from" validate:"required"`
	ValidUntil        time.Time     `json:"valid_until" validate:"required"`
}

type UpdateDiscountCodeRequest struct {
	Name              string        `json:"name" validate:"required,max=100"`
	Description       string        `json:"description" validate:"omitempty,max=500"`
	DiscountType      DiscountType  `json:"discount_type" validate:"required"`
	DiscountValue     float64       `json:"discount_value" validate:"required,gt=0"`
	MinOrderAmount    float64       `json:"min_order_amount" validate:"gte=0"`
	MaxDiscountAmount *float64      `json:"max_discount_amount" validate:"omitempty,gt=0"`
	UsageLimit        *int          `json:"usage_limit" validate:"omitempty,gt=0"`
	IsActive          bool          `json:"is_active"`
	ValidFrom         time.Time     `json:"valid_from" validate:"required"`
	ValidUntil        time.Time     `json:"valid_until" validate:"required"`
}

type ValidateDiscountCodeRequest struct {
	Code        string  `json:"code" validate:"required"`
	OrderAmount float64 `json:"order_amount" validate:"required,gt=0"`
}

type ValidateDiscountCodeResponse struct {
	IsValid       bool    `json:"is_valid"`
	Message       string  `json:"message"`
	DiscountType  DiscountType `json:"discount_type,omitempty"`
	DiscountValue float64 `json:"discount_value,omitempty"`
	DiscountAmount float64 `json:"discount_amount,omitempty"`
}

// List Orders Request
type ListOrdersRequest struct {
	Page        int         `json:"page" validate:"gte=1"`
	Limit       int         `json:"limit" validate:"gte=1,lte=100"`
	Status      *OrderStatus `json:"status"`
	Search      string      `json:"search"`
	DateFrom    *time.Time  `json:"date_from"`
	DateTo      *time.Time  `json:"date_to"`
	SortBy      string      `json:"sort_by"`
	SortOrder   string      `json:"sort_order"`
}

type ListOrdersResponse struct {
	Orders []*Order `json:"orders"`
	Total  int      `json:"total"`
	Page   int      `json:"page"`
	Limit  int      `json:"limit"`
	Pages  int      `json:"pages"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *ValidationError) Error() string {
	return e.Message
}

func NewValidationError(field, message string) *ValidationError {
	return &ValidationError{
		Field:   field,
		Message: message,
	}
}

// Order Statistics Model
type OrderStatistics struct {
	TotalOrders     int                    `json:"total_orders"`
	TotalRevenue    float64                `json:"total_revenue"`
	AverageOrderValue float64              `json:"average_order_value"`
	StatusCounts    map[OrderStatus]int    `json:"status_counts"`
	RecentOrders    []*Order               `json:"recent_orders"`
	DailyStats      []DailyOrderStats      `json:"daily_stats,omitempty"`
}

type DailyOrderStats struct {
	Date        string  `json:"date"`
	OrderCount  int     `json:"order_count"`
	Revenue     float64 `json:"revenue"`
} 