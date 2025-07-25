package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupProductRoutes configures product and variant routes
func SetupProductRoutes(adminProtected *gin.RouterGroup, productHandler *handler.ProductHandler, variantHandler *handler.VariantHandler) {
	// Product routes
	adminProtected.POST("/products", productHandler.CreateProduct)
	adminProtected.GET("/products", productHandler.ListProducts)
	adminProtected.GET("/products/:id", productHandler.GetProductByID)
	adminProtected.PUT("/products/:id", productHandler.UpdateProduct)

	// Variant routes
	adminProtected.POST("/variants", variantHandler.CreateVariant)
	adminProtected.GET("/variants", variantHandler.ListVariantsByProduct)
} 