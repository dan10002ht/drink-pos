package handler

import (
	"net/http"
	"strconv"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ShipperHandler struct {
	shipperService *service.ShipperService
}

func NewShipperHandler(shipperService *service.ShipperService) *ShipperHandler {
	return &ShipperHandler{
		shipperService: shipperService,
	}
}

// CreateShipper creates a new shipper
func (h *ShipperHandler) CreateShipper(c *gin.Context) {
	var req model.CreateShipperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	shipper, err := h.shipperService.CreateShipper(c.Request.Context(), &req, userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, model.ShipperResponse{Shipper: *shipper})
}

// GetShipper gets shipper by public ID
func (h *ShipperHandler) GetShipper(c *gin.Context) {
	publicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipper ID"})
		return
	}

	shipper, err := h.shipperService.GetShipper(c.Request.Context(), publicID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shipper not found"})
		return
	}

	c.JSON(http.StatusOK, model.ShipperResponse{Shipper: *shipper})
}

// ListShippers lists shippers with pagination and filters
func (h *ShipperHandler) ListShippers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	isActiveStr := c.Query("is_active")

	filters := make(map[string]interface{})
	if search != "" {
		filters["search"] = search
	}
	if isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filters["is_active"] = isActive
		}
	}

	response, err := h.shipperService.ListShippers(c.Request.Context(), filters, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateShipper updates shipper
func (h *ShipperHandler) UpdateShipper(c *gin.Context) {
	publicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipper ID"})
		return
	}

	var req model.UpdateShipperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	shipper, err := h.shipperService.UpdateShipper(c.Request.Context(), publicID, &req, userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, model.ShipperResponse{Shipper: *shipper})
}

// DeleteShipper deletes shipper
func (h *ShipperHandler) DeleteShipper(c *gin.Context) {
	publicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipper ID"})
		return
	}

	err = h.shipperService.DeleteShipper(c.Request.Context(), publicID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Shipper deleted successfully"})
}

// GetActiveShippers gets all active shippers
func (h *ShipperHandler) GetActiveShippers(c *gin.Context) {
	shippers, err := h.shipperService.GetActiveShippers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"shippers": shippers})
} 