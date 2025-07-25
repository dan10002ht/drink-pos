package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupIngredientRoutes configures ingredient routes
func SetupIngredientRoutes(adminProtected *gin.RouterGroup, ingredientHandler *handler.IngredientHandler) {
	// Ingredient routes
	adminProtected.POST("/ingredients", ingredientHandler.CreateIngredient)
	adminProtected.GET("/ingredients", ingredientHandler.GetAllIngredients)
	adminProtected.GET("/ingredients/:public_id", ingredientHandler.GetIngredient)
	adminProtected.PUT("/ingredients/:public_id", ingredientHandler.UpdateIngredient)
	adminProtected.DELETE("/ingredients/:public_id", ingredientHandler.DeleteIngredient)

	// Variant-Ingredient routes
	adminProtected.GET("/variants/:variant_public_id/ingredients", ingredientHandler.GetVariantIngredients)
	adminProtected.POST("/variants/:variant_public_id/ingredients", ingredientHandler.AddIngredientToVariant)
	adminProtected.DELETE("/variants/:variant_public_id/ingredients/:ingredient_public_id", ingredientHandler.RemoveIngredientFromVariant)
	adminProtected.GET("/variants/:variant_public_id/cost", ingredientHandler.CalculateVariantCost)
} 