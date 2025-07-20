package handler

import (
	"net/http"
	"strconv"
	"time"

	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	orderService *service.OrderService
	orderRepo    *repository.OrderRepository
	jwtService   *jwt.JWTService
}

func NewOrderHandler(orderService *service.OrderService, orderRepo *repository.OrderRepository, jwtService *jwt.JWTService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
		orderRepo:    orderRepo,
		jwtService:   jwtService,
	}
}

// CreateOrder creates a new order
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req model.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Create order
	order, err := h.orderService.CreateOrder(c.Request.Context(), &req, userID.(string))
	if err != nil {
		// Log the actual error for debugging
		c.Error(err)
		
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to create order: "+err.Error())
		return
	}

	response.SuccessWithStatus(c, http.StatusCreated, "Order created successfully", order)
}

// GetOrderByID gets order by public ID
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	publicID := c.Param("id")
	if publicID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	// Get order
	order, err := h.orderService.GetOrderByID(c.Request.Context(), publicID)
	if err != nil {
		response.NotFound(c, "Order not found")
		return
	}

	response.Success(c, order, "Order retrieved successfully")
}

// UpdateOrderStatus updates order status
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	publicID := c.Param("id")
	if publicID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	var req model.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Update status
	order, err := h.orderService.UpdateOrderStatus(c.Request.Context(), publicID, &req, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to update order status")
		return
	}

	response.Success(c, order, "Order status updated successfully")
}

// ListOrders lists orders with filtering and pagination
func (h *OrderHandler) ListOrders(c *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")

	// Parse date filters
	var dateFrom, dateTo *time.Time
	if dateFromStr := c.Query("date_from"); dateFromStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateFromStr); err == nil {
			dateFrom = &parsed
		}
	}
	if dateToStr := c.Query("date_to"); dateToStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateToStr); err == nil {
			dateTo = &parsed
		}
	}

	// Parse status enum
	var statusEnum *model.OrderStatus
	if status != "" {
		statusEnum = (*model.OrderStatus)(&status)
	}

	req := &model.ListOrdersRequest{
		Page:      page,
		Limit:     limit,
		Status:    statusEnum,
		Search:    search,
		DateFrom:  dateFrom,
		DateTo:    dateTo,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	// Get orders
	responseData, err := h.orderService.ListOrders(c.Request.Context(), req)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch orders")
		return
	}

	response.Success(c, responseData, "Orders retrieved successfully")
}

// ValidateDiscountCode validates discount code
func (h *OrderHandler) ValidateDiscountCode(c *gin.Context) {
	var req model.ValidateDiscountCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	// Validate discount code
	validation, err := h.orderService.ValidateDiscountCode(c.Request.Context(), &req)
	if err != nil {
		response.InternalServerError(c, "Failed to validate discount code")
		return
	}

	response.Success(c, validation, "Discount code validated successfully")
}

// GetOrderStatuses returns available order statuses
func (h *OrderHandler) GetOrderStatuses(c *gin.Context) {
	statuses := []gin.H{
		{"value": model.OrderStatusPending, "label": "Chờ xử lý"},
		{"value": model.OrderStatusProcessing, "label": "Đang xử lý"},
		{"value": model.OrderStatusCompleted, "label": "Đã xử lý"},
		{"value": model.OrderStatusCancelled, "label": "Đã hủy"},
	}

	response.Success(c, statuses, "Order statuses retrieved successfully")
}

// GetPaymentMethods returns available payment methods
func (h *OrderHandler) GetPaymentMethods(c *gin.Context) {
	methods := []gin.H{
		{"value": "cash", "label": "Tiền mặt"},
		{"value": "card", "label": "Thẻ tín dụng"},
		{"value": "transfer", "label": "Chuyển khoản"},
		{"value": "momo", "label": "MoMo"},
		{"value": "vnpay", "label": "VNPay"},
	}

	response.Success(c, methods, "Payment methods retrieved successfully")
}



// GetOrderStatistics returns order statistics
func (h *OrderHandler) GetOrderStatistics(c *gin.Context) {
	// Parse date range if provided
	var dateFrom, dateTo *time.Time
	if dateFromStr := c.Query("date_from"); dateFromStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateFromStr); err == nil {
			dateFrom = &parsed
		}
	}
	if dateToStr := c.Query("date_to"); dateToStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateToStr); err == nil {
			dateTo = &parsed
		}
	}

	// Get statistics from service
	stats, err := h.orderService.GetOrderStatistics(c.Request.Context(), dateFrom, dateTo)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch order statistics")
		return
	}

	response.Success(c, stats, "Order statistics retrieved successfully")
} 