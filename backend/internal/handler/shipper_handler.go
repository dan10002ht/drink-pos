package handler

import (
	"strconv"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ShipperHandler struct {
	shipperService *service.ShipperService
	userRepo       *repository.UserRepository
}

func NewShipperHandler(shipperService *service.ShipperService, userRepo *repository.UserRepository) *ShipperHandler {
	return &ShipperHandler{
		shipperService: shipperService,
		userRepo:       userRepo,
	}
}

// CreateShipper creates a new shipper
func (h *ShipperHandler) CreateShipper(c *gin.Context) {
	var req model.CreateShipperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	userPublicID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	// Get user by public_id to get internal ID
	user, err := h.userRepo.GetByPublicID(userPublicID.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user")
		return
	}

	shipper, err := h.shipperService.CreateShipper(c.Request.Context(), &req, user.ID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, model.ShipperResponse{Shipper: *shipper}, "Shipper created successfully")
}

// GetShipper gets shipper by public ID
func (h *ShipperHandler) GetShipper(c *gin.Context) {
	publicID := c.Param("id")

	shipper, err := h.shipperService.GetShipper(c.Request.Context(), publicID)
	if err != nil {
		response.NotFound(c, "Shipper not found")
		return
	}

	response.Success(c, model.ShipperResponse{Shipper: *shipper}, "Shipper fetched successfully")
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

	resp, err := h.shipperService.ListShippers(c.Request.Context(), filters, page, limit)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, resp, "Shippers fetched successfully")
}

// UpdateShipper updates shipper
func (h *ShipperHandler) UpdateShipper(c *gin.Context) {
	publicID := c.Param("id")

	var req model.UpdateShipperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	userPublicID, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	// Get user by public_id to get internal ID
	user, err := h.userRepo.GetByPublicID(userPublicID.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user")
		return
	}

	shipper, err := h.shipperService.UpdateShipper(c.Request.Context(), publicID, &req, user.ID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, model.ShipperResponse{Shipper: *shipper}, "Shipper updated successfully")
}

// DeleteShipper deletes shipper
func (h *ShipperHandler) DeleteShipper(c *gin.Context) {
	publicID := c.Param("id")

	err := h.shipperService.DeleteShipper(c.Request.Context(), publicID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, "Shipper deleted successfully", "Shipper deleted successfully")
}

// GetActiveShippers gets all active shippers
func (h *ShipperHandler) GetActiveShippers(c *gin.Context) {
	shippers, err := h.shipperService.GetActiveShippers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, shippers, "Active shippers fetched successfully")
}
