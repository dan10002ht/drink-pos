package handler

import (
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type VariantHandler struct {
	variantService *service.VariantService
}

func NewVariantHandler(variantService *service.VariantService) *VariantHandler {
	return &VariantHandler{
		variantService: variantService,
	}
}

type CreateVariantRequest struct {
	ProductID string  `json:"product_id" binding:"required"`
	Name      string  `json:"name" binding:"required"`
	Price     float64 `json:"price" binding:"required"`
}

// POST /api/admin/variants
func (h *VariantHandler) CreateVariant(c *gin.Context) {
	var req CreateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body")
		return
	}
	variant, err := h.variantService.CreateVariant(c.Request.Context(), req.ProductID, req.Name, req.Price)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, variant, "Variant created successfully")
}

// GET /api/admin/variants?product_id=...
func (h *VariantHandler) ListVariantsByProduct(c *gin.Context) {
	productID := c.Query("product_id")
	if productID == "" {
		response.BadRequest(c, "Missing product_id")
		return
	}
	variants, err := h.variantService.ListVariantsByProduct(c.Request.Context(), productID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, variants, "Variant list fetched successfully")
} 