package handler

import (
	"database/sql"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/pkg/response"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminUserHandler struct {
	userRepo *repository.UserRepository
}

func NewAdminUserHandler() *AdminUserHandler {
	return &AdminUserHandler{
		userRepo: repository.NewUserRepository(),
	}
}

// Request/Response structs
type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin staff customer"`
	IsActive bool   `json:"is_active"`
}

type UpdateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password"` // Optional
	Role     string `json:"role" binding:"required,oneof=admin staff customer"`
	IsActive bool   `json:"is_active"`
}

type UserResponse struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	Role          string    `json:"role"`
	IsActive      bool      `json:"is_active"`
	EmailVerified bool      `json:"email_verified"`
	LastLogin     *time.Time `json:"last_login,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	TotalOrders   int       `json:"total_orders"`
	TotalSpent    float64   `json:"total_spent"`
	LastOrderDate *time.Time `json:"last_order_date,omitempty"`
	RecentOrders  []OrderResponse `json:"recent_orders,omitempty"`
}

type UsersListResponse struct {
	Users []UserResponse `json:"users"`
	Total int           `json:"total"`
	Pages int           `json:"pages"`
}

// GET /api/admin/users
func (h *AdminUserHandler) GetUsers(c *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	role := c.Query("role")
	isActive := c.Query("is_active")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")

	// Validate pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Get users from repository
	users, total, err := h.userRepo.GetUsersWithFilters(page, limit, search, role, isActive, sortBy, sortOrder)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch users")
		return
	}

	// Convert to response format
	userResponses := make([]UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = h.toUserResponse(&user)
	}

	// Calculate pages
	pages := (total + limit - 1) / limit

	response.Success(c, UsersListResponse{
		Users: userResponses,
		Total: total,
		Pages: pages,
	}, "Users retrieved successfully")
}

// GET /api/admin/users/:id
func (h *AdminUserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		response.BadRequest(c, "User ID is required")
		return
	}

	// Get user from repository
	user, err := h.userRepo.GetByPublicID(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	// Get user statistics
	stats, err := h.userRepo.GetUserStatistics(user.ID)
	if err != nil {
		// Log error but don't fail the request
		stats = &model.UserStatistics{}
	}

	// Get recent orders
	recentOrders, err := h.userRepo.GetUserRecentOrders(user.ID, 5)
	if err != nil {
		recentOrders = []model.Order{}
	}

	// Convert to response format
	userResp := h.toUserResponseWithStats(user, stats, recentOrders)

	response.Success(c, userResp, "User retrieved successfully")
}

// POST /api/admin/users
func (h *AdminUserHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	// Check if email already exists
	existingUser, _ := h.userRepo.GetByEmail(req.Email)
	if existingUser != nil {
		response.Error(c, http.StatusConflict, "Email already exists")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Create user
	phone := sql.NullString{}
	if req.Phone != "" {
		phone.String = req.Phone
		phone.Valid = true
	}
	
	user := &model.User{
		PublicID:     uuid.New().String(),
		Username:     req.Email, // Use email as username for now
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.Name,
		Phone:        phone,
		Role:         req.Role,
		IsActive:     req.IsActive,
		IsGuest:      false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err = h.userRepo.Create(user)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create user")
		return
	}

	response.Success(c, h.toUserResponse(user), "User created successfully")
}

// PUT /api/admin/users/:id
func (h *AdminUserHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		response.BadRequest(c, "User ID is required")
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	// Get existing user
	existingUser, err := h.userRepo.GetByPublicID(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	// Check if email already exists (if changed)
	if req.Email != existingUser.Email {
		otherUser, _ := h.userRepo.GetByEmail(req.Email)
		if otherUser != nil {
			response.Error(c, http.StatusConflict, "Email already exists")
			return
		}
	}

	// Update user fields
	existingUser.FullName = req.Name
	existingUser.Email = req.Email
	
	// Handle phone field
	if req.Phone != "" {
		existingUser.Phone.String = req.Phone
		existingUser.Phone.Valid = true
	} else {
		existingUser.Phone.Valid = false
	}
	
	existingUser.Role = req.Role
	existingUser.IsActive = req.IsActive
	existingUser.UpdatedAt = time.Now()

	// Update password if provided
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to hash password")
			return
		}
		existingUser.PasswordHash = string(hashedPassword)
	}

	// Save to database
	err = h.userRepo.Update(existingUser)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update user")
		return
	}

	response.Success(c, h.toUserResponse(existingUser), "User updated successfully")
}

// DELETE /api/admin/users/:id
func (h *AdminUserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		response.BadRequest(c, "User ID is required")
		return
	}

	// Get existing user
	existingUser, err := h.userRepo.GetByPublicID(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	// Soft delete by setting is_active to false
	existingUser.IsActive = false
	existingUser.UpdatedAt = time.Now()

	err = h.userRepo.Update(existingUser)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	response.Success(c, nil, "User deleted successfully")
}

// Helper methods
func (h *AdminUserHandler) toUserResponse(user *model.User) UserResponse {
	phone := ""
	if user.Phone.Valid {
		phone = user.Phone.String
	}
	
	return UserResponse{
		ID:            user.PublicID,
		Name:          user.FullName,
		Email:         user.Email,
		Phone:         phone,
		Role:          user.Role,
		IsActive:      user.IsActive,
		EmailVerified: true, // TODO: Implement email verification
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
	}
}

func (h *AdminUserHandler) toUserResponseWithStats(user *model.User, stats *model.UserStatistics, recentOrders []model.Order) UserResponse {
	userResp := h.toUserResponse(user)
	userResp.TotalOrders = stats.TotalOrders
	userResp.TotalSpent = stats.TotalSpent
	userResp.LastOrderDate = stats.LastOrderDate

	// Convert recent orders to response format
	orderResponses := make([]OrderResponse, len(recentOrders))
	for i, order := range recentOrders {
		orderResponses[i] = h.toOrderResponse(&order)
	}
	userResp.RecentOrders = orderResponses

	return userResp
}

func (h *AdminUserHandler) toOrderResponse(order *model.Order) OrderResponse {
	return OrderResponse{
		ID:          order.PublicID,
		OrderNumber: order.OrderNumber,
		Status:      string(order.Status),
		TotalAmount: order.TotalAmount,
		CreatedAt:   order.CreatedAt.Format(time.RFC3339),
	}
} 