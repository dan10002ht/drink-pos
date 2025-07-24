package handler

import (
	"net/http"
	"strconv"

	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type DeliveryHandler struct {
	deliveryService *service.DeliveryService
	deliveryRepo    *repository.DeliveryRepository
	jwtService      *jwt.JWTService
}

func NewDeliveryHandler(deliveryService *service.DeliveryService, deliveryRepo *repository.DeliveryRepository, jwtService *jwt.JWTService) *DeliveryHandler {
	return &DeliveryHandler{
		deliveryService: deliveryService,
		deliveryRepo:    deliveryRepo,
		jwtService:      jwtService,
	}
}

// CreateDeliveryOrder creates a new delivery order
func (h *DeliveryHandler) CreateDeliveryOrder(c *gin.Context) {
	var req model.CreateDeliveryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	deliveryOrder, err := h.deliveryService.CreateDeliveryOrder(c.Request.Context(), &req, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to create delivery order: "+err.Error())
		return
	}

	response.SuccessWithStatus(c, http.StatusCreated, "Delivery order created successfully", deliveryOrder)
}

// GetDeliveryOrderByID gets delivery order by public ID
func (h *DeliveryHandler) GetDeliveryOrderByID(c *gin.Context) {
	publicID := c.Param("id")
	if publicID == "" {
		response.BadRequest(c, "Delivery order ID is required")
		return
	}

	deliveryOrder, err := h.deliveryService.GetDeliveryOrderByID(c.Request.Context(), publicID)
	if err != nil {
		response.InternalServerError(c, "Failed to get delivery order: "+err.Error())
		return
	}

	response.Success(c, deliveryOrder, "Delivery order retrieved successfully")
}

// UpdateDeliveryOrder updates delivery order
func (h *DeliveryHandler) UpdateDeliveryOrder(c *gin.Context) {
	publicID := c.Param("id")
	if publicID == "" {
		response.BadRequest(c, "Delivery order ID is required")
		return
	}

	var req model.UpdateDeliveryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	deliveryOrder, err := h.deliveryService.UpdateDeliveryOrder(c.Request.Context(), publicID, &req, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to update delivery order: "+err.Error())
		return
	}

	response.Success(c, deliveryOrder, "Delivery order updated successfully")
}

// ListDeliveryOrders lists delivery orders with filtering
func (h *DeliveryHandler) ListDeliveryOrders(c *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	orderID := c.Query("order_id")
	shipperID := c.Query("shipper_id")
	status := c.Query("status")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")

	var deliveryStatus *model.DeliveryStatus
	if status != "" {
		ds := model.DeliveryStatus(status)
		deliveryStatus = &ds
	}

	req := &model.ListDeliveryOrdersRequest{
		Page:      page,
		Limit:     limit,
		OrderID:   orderID,
		ShipperID: shipperID,
		Status:    deliveryStatus,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	resp, err := h.deliveryService.ListDeliveryOrders(c.Request.Context(), req)
	if err != nil {
		response.InternalServerError(c, "Failed to list delivery orders: "+err.Error())
		return
	}

	response.Success(c, resp, "Delivery orders retrieved successfully")
}

// AssignShipperToOrder assigns a shipper to an order
func (h *DeliveryHandler) AssignShipperToOrder(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	var req model.AssignShipperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	err := h.deliveryService.AssignShipperToOrder(c.Request.Context(), orderID, &req, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to assign shipper: "+err.Error())
		return
	}

	response.Success(c, nil, "Shipper assigned successfully")
}

// SplitOrder splits an order into multiple delivery orders
func (h *DeliveryHandler) SplitOrder(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	var req model.SplitOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	err := h.deliveryService.SplitOrder(c.Request.Context(), orderID, &req, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to split order: "+err.Error())
		return
	}

	response.Success(c, nil, "Order split successfully")
}

// GetDeliveryOrdersByOrderID gets all delivery orders for a specific order
func (h *DeliveryHandler) GetDeliveryOrdersByOrderID(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		response.BadRequest(c, "Order ID is required")
		return
	}

	deliveryOrders, err := h.deliveryService.GetDeliveryOrdersByOrderID(c.Request.Context(), orderID)
	if err != nil {
		response.InternalServerError(c, "Failed to get delivery orders: "+err.Error())
		return
	}

	response.Success(c, deliveryOrders, "Delivery orders retrieved successfully")
}

// GetAvailableShippers gets all active shippers
func (h *DeliveryHandler) GetAvailableShippers(c *gin.Context) {
	shippers, err := h.deliveryService.GetAvailableShippers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get available shippers: "+err.Error())
		return
	}

	response.Success(c, shippers, "Available shippers retrieved successfully")
}

// UpdateDeliveryStatus updates delivery status
func (h *DeliveryHandler) UpdateDeliveryStatus(c *gin.Context) {
	deliveryID := c.Param("id")
	if deliveryID == "" {
		response.BadRequest(c, "Delivery order ID is required")
		return
	}

	var req struct {
		Status string `json:"status" validate:"required"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request data")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	status := model.DeliveryStatus(req.Status)
	deliveryOrder, err := h.deliveryService.UpdateDeliveryStatus(c.Request.Context(), deliveryID, status, req.Notes, userID.(string))
	if err != nil {
		if validationErr, ok := err.(*model.ValidationError); ok {
			response.BadRequest(c, validationErr.Message)
			return
		}
		response.InternalServerError(c, "Failed to update delivery status: "+err.Error())
		return
	}

	response.Success(c, deliveryOrder, "Delivery status updated successfully")
}

// GetDeliveryStatuses returns available delivery statuses
func (h *DeliveryHandler) GetDeliveryStatuses(c *gin.Context) {
	statuses := []gin.H{
		{"value": model.DeliveryStatusPending, "label": "Chờ giao hàng"},
		{"value": model.DeliveryStatusAssigned, "label": "Đã assign shipper"},
		{"value": model.DeliveryStatusPickedUp, "label": "Shipper đã nhận hàng"},
		{"value": model.DeliveryStatusInTransit, "label": "Đang giao hàng"},
		{"value": model.DeliveryStatusDelivered, "label": "Đã giao hàng thành công"},
		{"value": model.DeliveryStatusFailed, "label": "Giao hàng thất bại"},
		{"value": model.DeliveryStatusCancelled, "label": "Đã hủy giao hàng"},
	}

	response.Success(c, statuses, "Delivery statuses retrieved successfully")
}
