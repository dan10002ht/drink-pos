package handler

import (
	"fmt"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req model.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	product, err := h.productService.CreateProduct(c.Request.Context(), &req)
	if err != nil {
		// Check if it's a validation error
		if validationErr, ok := err.(*service.ValidationError); ok {
			response.Error(c, http.StatusBadRequest, validationErr.Message)
			return
		}
		fmt.Println("Error CreateProduct:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to create product")
		return
	}

	response.SuccessWithStatus(c, http.StatusCreated, "Product created successfully", product)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	if productID == "" {
		response.Error(c, http.StatusBadRequest, "Product ID is required")
		return
	}

	var req model.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	product, err := h.productService.UpdateProductByPublicID(c.Request.Context(), productID, &req)
	if err != nil {
		// Check if it's a validation error
		if validationErr, ok := err.(*service.ValidationError); ok {
			response.Error(c, http.StatusBadRequest, validationErr.Message)
			return
		}
		// Check if product not found
		if err.Error() == "product not found" {
			response.Error(c, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to update product")
		return
	}

	response.SuccessWithStatus(c, http.StatusOK, "Product updated successfully", product)
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
	// Get query parameters
	search := c.Query("search")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "20")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")

	// Parse pagination
	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		pageNum = 1
	}

	limitNum, err := strconv.Atoi(limit)
	if err != nil || limitNum < 1 || limitNum > 100 {
		limitNum = 20
	}

	// Validate sort order
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Validate sort by field
	validSortFields := map[string]bool{
		"name":       true,
		"created_at": true,
		"updated_at": true,
	}
	if !validSortFields[sortBy] {
		sortBy = "created_at"
	}

	// Create filter
	filter := &model.ProductFilter{
		Search:    search,
		Page:      pageNum,
		Limit:     limitNum,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	// Get products with pagination
	result, err := h.productService.ListProductsWithPagination(c.Request.Context(), filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch products")
		return
	}

	response.SuccessWithStatus(c, http.StatusOK, "Products fetched successfully", result)
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	productID := c.Param("id")
	if productID == "" {
		response.Error(c, http.StatusBadRequest, "Product ID is required")
		return
	}

	product, err := h.productService.GetProductByPublicID(c.Request.Context(), productID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Product not found")
		return
	}

	response.SuccessWithStatus(c, http.StatusOK, "Product fetched successfully", product)
}
