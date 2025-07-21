package routes

import (
	"food-pos-backend/internal/handler"
	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/middleware"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(r *gin.Engine, jwtService *jwt.JWTService, adminHandler *handler.AdminHandler, productHandler *handler.ProductHandler, variantHandler *handler.VariantHandler, ingredientHandler *handler.IngredientHandler, orderHandler *handler.OrderHandler, shipperHandler *handler.ShipperHandler) {
	// API routes group
	api := r.Group("/api")
	{
		// Admin routes
		admin := api.Group("/admin")
		{
			admin.POST("/login", adminHandler.Login)

			// Protected admin routes
			adminProtected := admin.Group("")
			adminProtected.Use(middleware.AuthMiddleware(jwtService))
			adminProtected.Use(middleware.AdminMiddleware())
			{
				// Product routes
				adminProtected.POST("/products", productHandler.CreateProduct)
				adminProtected.GET("/products", productHandler.ListProducts)
				adminProtected.GET("/products/:id", productHandler.GetProductByID)
				adminProtected.PUT("/products/:id", productHandler.UpdateProduct)

				// Variant routes
				adminProtected.POST("/variants", variantHandler.CreateVariant)
				adminProtected.GET("/variants", variantHandler.ListVariantsByProduct)

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
				adminProtected.GET("/variants/:variant_public_id/cost", ingredientHandler.CalculateVariantCost)ại migration tạo trigger

				// Order routes
				adminProtected.POST("/orders", orderHandler.CreateOrder)
				adminProtected.GET("/orders", orderHandler.ListOrders)
				adminProtected.GET("/orders/:id", orderHandler.GetOrderByID)
				adminProtected.PUT("/orders/:id", orderHandler.UpdateOrder)
				adminProtected.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
				adminProtected.POST("/orders/validate-discount", orderHandler.ValidateDiscountCode)
				adminProtected.GET("/orders/statuses", orderHandler.GetOrderStatuses)
				adminProtected.GET("/orders/payment-methods", orderHandler.GetPaymentMethods)
				adminProtected.GET("/orders/statistics", orderHandler.GetOrderStatistics)

				// Shipper routes
				adminProtected.POST("/shippers", shipperHandler.CreateShipper)
				adminProtected.GET("/shippers", shipperHandler.ListShippers)
				adminProtected.GET("/shippers/:id", shipperHandler.GetShipper)
				adminProtected.PUT("/shippers/:id", shipperHandler.UpdateShipper)
				adminProtected.DELETE("/shippers/:id", shipperHandler.DeleteShipper)
				adminProtected.GET("/shippers/active", shipperHandler.GetActiveShippers)
			}
		}

		// Public routes (if any)
		_ = api.Group("/public")
		{
			// Add public routes here when needed
			// public.GET("/products", productHandler.ListPublicProducts)
		}
	}

	// Health check route
	r.GET("/health", func(c *gin.Context) {
		response.Success(c, gin.H{
			"status":  "ok",
			"message": "3 O'CLOCK API is running",
		}, "API is running")
	})
} 