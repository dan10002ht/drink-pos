package handler

import (
	"fmt"
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
	userRepo     *repository.UserRepository
	jwtService   *jwt.JWTService
}

func NewOrderHandler(orderService *service.OrderService, orderRepo *repository.OrderRepository, userRepo *repository.UserRepository, jwtService *jwt.JWTService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
		orderRepo:    orderRepo,
		userRepo:     userRepo,
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

	var userID int64
	if v, exists := c.Get("user_id"); exists {
		if s, ok := v.(string); ok {
			// Get internal user ID from database using public_id
			user, err := h.userRepo.GetByPublicID(s)
			if err != nil {
				response.BadRequest(c, "Invalid user")
				return
			}
			userID = user.ID
		}
	}

	order, err := h.orderService.CreateOrder(c.Request.Context(), &req, userID)
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

// Thêm struct response

type OrderItemResponse struct {
	ID          string  `json:"id"`
	VariantID   string  `json:"variant_id"`
	ProductName string  `json:"product_name"`
	VariantName string  `json:"variant_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	TotalPrice  float64 `json:"total_price"`
	Notes       *string `json:"notes"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

type ShipperResponse struct {
	PublicID string  `json:"public_id"`
	Name     string  `json:"name"`
	Phone    string  `json:"phone"`
	Email    *string `json:"email"`
	IsActive bool    `json:"is_active"`
}

type OrderResponse struct {
	ID             string              `json:"id"`
	OrderNumber    string              `json:"order_number"`
	CustomerName   string              `json:"customer_name"`
	CustomerPhone  string              `json:"customer_phone"`
	CustomerEmail  string              `json:"customer_email"`
	Status         string              `json:"status"`
	Subtotal       float64             `json:"subtotal"`
	DiscountAmount float64             `json:"discount_amount"`
	DiscountType   *string             `json:"discount_type"`
	DiscountCode   string              `json:"discount_code"`
	DiscountNote   *string             `json:"discount_note"`
	ManualDiscountAmount float64             `json:"manual_discount_amount"`
	ShippingFee    float64             `json:"shipping_fee"`
	TotalAmount    float64             `json:"total_amount"`
	PaymentMethod  string              `json:"payment_method"`
	PaymentStatus  string              `json:"payment_status"`
	Notes          *string             `json:"notes"`
	CreatedBy      string              `json:"created_by"`
	UpdatedBy      string              `json:"updated_by"`
	CreatedAt      string              `json:"created_at"`
	UpdatedAt      string              `json:"updated_at"`
	Items          []OrderItemResponse `json:"items"`
	ItemsCount     int                 `json:"items_count"`
	Shipper        *ShipperResponse    `json:"shipper,omitempty"`
}

func toOrderItemResponse(item model.OrderItem) OrderItemResponse {
	var notesPtr *string
	if item.Notes.Valid {
		notesPtr = &item.Notes.String
	}
	return OrderItemResponse{
		ID:          strconv.FormatInt(item.ID, 10),
		VariantID:   strconv.FormatInt(item.VariantID, 10),
		ProductName: item.ProductName,
		VariantName: item.VariantName,
		Quantity:    item.Quantity,
		UnitPrice:   item.UnitPrice,
		TotalPrice:  item.TotalPrice,
		Notes:       notesPtr,
		CreatedAt:   item.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   item.UpdatedAt.Format(time.RFC3339),
	}
}

// Helper method to get user public ID from internal ID
func (h *OrderHandler) getUserPublicID(internalID int64) string {
	user, err := h.userRepo.GetByID(internalID)
	if err != nil {
		return strconv.FormatInt(internalID, 10) // Fallback to internal ID as string
	}
	return user.PublicID
}

func (h *OrderHandler) toOrderResponse(order *model.Order) *OrderResponse {
	var notesPtr, discountNotePtr *string
	if order.Notes.Valid {
		notesPtr = &order.Notes.String
	}
	if order.DiscountNote.Valid {
		discountNotePtr = &order.DiscountNote.String
	}
	var discountTypePtr *string
	if order.DiscountType != nil {
		discountTypeStr := string(*order.DiscountType)
		discountTypePtr = &discountTypeStr
	}
	items := make([]OrderItemResponse, 0, len(order.Items))
	for _, item := range order.Items {
		items = append(items, toOrderItemResponse(item))
	}
	var shipperResp *ShipperResponse
	if order.Shipper != nil {
		shipperResp = &ShipperResponse{
			PublicID: order.Shipper.PublicID.String(),
			Name:     order.Shipper.Name,
			Phone:    order.Shipper.Phone,
			Email:    order.Shipper.Email,
			IsActive: order.Shipper.IsActive,
		}
	}
	return &OrderResponse{
		ID:             order.PublicID,
		OrderNumber:    order.OrderNumber,
		CustomerName:   order.CustomerName,
		CustomerPhone:  order.CustomerPhone,
		CustomerEmail:  order.CustomerEmail,
		Status:         string(order.Status),
		Subtotal:       order.Subtotal,
		DiscountAmount: order.DiscountAmount,
		DiscountType:   discountTypePtr,
		DiscountCode:   order.DiscountCode,
		DiscountNote:   discountNotePtr,
		ManualDiscountAmount: order.ManualDiscountAmount,
		ShippingFee:    order.ShippingFee,
		TotalAmount:    order.TotalAmount,
		PaymentMethod:  order.PaymentMethod,
		PaymentStatus:  string(order.PaymentStatus),
		Notes:          notesPtr,
		CreatedBy:      h.getUserPublicID(order.CreatedBy),
		UpdatedBy:      h.getUserPublicID(order.UpdatedBy),
		CreatedAt:      order.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      order.UpdatedAt.Format(time.RFC3339),
		Items:          items,
		ItemsCount:     order.ItemsCount,
		Shipper:        shipperResp,
	}
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
		fmt.Println(err)
		response.NotFound(c, "Order not found")
		return
	}

	response.Success(c, h.toOrderResponse(order), "Order retrieved successfully")
}

// UpdateOrder updates an order and its items
func (h *OrderHandler) UpdateOrder(c *gin.Context) {
	publicID := c.Param("id")
	if publicID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	var req model.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	if len(req.Items) == 0 {
		response.BadRequest(c, "Phải có ít nhất 1 sản phẩm trong đơn hàng")
		return
	}
	for _, item := range req.Items {
		if item.Quantity <= 0 {
			response.BadRequest(c, "Số lượng sản phẩm phải lớn hơn 0")
			return
		}
	}

	userPublicID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get internal user ID from database using public_id
	user, err := h.userRepo.GetByPublicID(userPublicID.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user")
		return
	}

	order, err := h.orderService.UpdateOrder(c.Request.Context(), publicID, &req, user.ID)
	if err != nil {
		response.InternalServerError(c, "Failed to update order: "+err.Error())
		return
	}

	response.Success(c, h.toOrderResponse(order), "Order updated successfully")
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
	userPublicID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get internal user ID from database using public_id
	user, err := h.userRepo.GetByPublicID(userPublicID.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user")
		return
	}

	// Update status
	order, err := h.orderService.UpdateOrderStatus(c.Request.Context(), publicID, &req, user.ID)
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
