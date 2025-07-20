package model

type User struct {
	ID          string `json:"-"` // internal
	PublicID    string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	PasswordHash string `json:"-"`
	FullName    string `json:"full_name"`
	Role        string `json:"role"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
} 