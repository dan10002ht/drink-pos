package handler

import (
	"net/http"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type IngredientHandler struct {
	ingredientService *service.IngredientService
}

func NewIngredientHandler(ingredientService *service.IngredientService) *IngredientHandler {
	return &IngredientHandler{
		ingredientService: ingredientService,
	}
}

// CreateIngredient creates a new ingredient
func (h *IngredientHandler) CreateIngredient(c *gin.Context) {
	var req model.CreateIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	ingredient, err := h.ingredientService.CreateIngredient(c.Request.Context(), &req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.SuccessWithStatus(c, http.StatusCreated, "Ingredient created successfully", ingredient)
}

// GetIngredient gets an ingredient by public ID
func (h *IngredientHandler) GetIngredient(c *gin.Context) {
	publicID := c.Param("public_id")
	if publicID == "" {
		response.BadRequest(c, "public_id is required")
		return
	}

	ingredient, err := h.ingredientService.GetIngredient(c.Request.Context(), publicID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	if ingredient == nil {
		response.NotFound(c, "ingredient not found")
		return
	}

	response.Success(c, ingredient, "Ingredient fetched successfully")
}

// GetAllIngredients gets all ingredients
func (h *IngredientHandler) GetAllIngredients(c *gin.Context) {
	ingredients, err := h.ingredientService.GetAllIngredients(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	if ingredients == nil {
		ingredients = make([]*model.Ingredient, 0)
	}
	response.Success(c, ingredients, "Ingredients fetched successfully")
}

// UpdateIngredient updates an ingredient
func (h *IngredientHandler) UpdateIngredient(c *gin.Context) {
	publicID := c.Param("public_id")
	if publicID == "" {
		response.BadRequest(c, "public_id is required")
		return
	}

	var req model.UpdateIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	ingredient, err := h.ingredientService.UpdateIngredient(c.Request.Context(), publicID, &req)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "ingredient not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, ingredient, "Ingredient updated successfully")
}

// DeleteIngredient deletes an ingredient
func (h *IngredientHandler) DeleteIngredient(c *gin.Context) {
	publicID := c.Param("public_id")
	if publicID == "" {
		response.BadRequest(c, "public_id is required")
		return
	}

	err := h.ingredientService.DeleteIngredient(c.Request.Context(), publicID)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "ingredient not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "ingredient deleted successfully"}, "Ingredient deleted successfully")
}

// GetVariantIngredients gets all ingredients for a variant
func (h *IngredientHandler) GetVariantIngredients(c *gin.Context) {
	variantPublicID := c.Param("variant_public_id")
	if variantPublicID == "" {
		response.BadRequest(c, "variant_public_id is required")
		return
	}

	ingredients, err := h.ingredientService.GetVariantIngredients(c.Request.Context(), variantPublicID)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "variant not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, ingredients, "Variant ingredients fetched successfully")
}

// AddIngredientToVariant adds an ingredient to a variant
func (h *IngredientHandler) AddIngredientToVariant(c *gin.Context) {
	variantPublicID := c.Param("variant_public_id")
	if variantPublicID == "" {
		response.BadRequest(c, "variant_public_id is required")
		return
	}

	var req model.CreateVariantIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	err := h.ingredientService.AddIngredientToVariant(c.Request.Context(), variantPublicID, &req)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "variant or ingredient not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "ingredient added to variant successfully"}, "Ingredient added to variant successfully")
}

// RemoveIngredientFromVariant removes an ingredient from a variant
func (h *IngredientHandler) RemoveIngredientFromVariant(c *gin.Context) {
	variantPublicID := c.Param("variant_public_id")
	ingredientPublicID := c.Param("ingredient_public_id")
	
	if variantPublicID == "" {
		response.BadRequest(c, "variant_public_id is required")
		return
	}
	if ingredientPublicID == "" {
		response.BadRequest(c, "ingredient_public_id is required")
		return
	}

	err := h.ingredientService.RemoveIngredientFromVariant(c.Request.Context(), variantPublicID, ingredientPublicID)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "variant or ingredient not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "ingredient removed from variant successfully"}, "Ingredient removed from variant successfully")
}

// CalculateVariantCost calculates the cost of a variant
func (h *IngredientHandler) CalculateVariantCost(c *gin.Context) {
	variantPublicID := c.Param("variant_public_id")
	if variantPublicID == "" {
		response.BadRequest(c, "variant_public_id is required")
		return
	}

	cost, err := h.ingredientService.CalculateVariantCost(c.Request.Context(), variantPublicID)
	if err != nil {
		if err == service.ErrNotFound {
			response.NotFound(c, "variant not found")
			return
		}
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{"cost": cost}, "Variant cost calculated successfully")
} 