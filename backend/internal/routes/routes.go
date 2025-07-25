package routes

import (
	"food-pos-backend/internal/handler"
	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/middleware"
	"food-pos-backend/internal/routes/admin"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(r *gin.Engine, jwtService *jwt.JWTService, adminHandler *handler.AdminHandler, productHandler *handler.ProductHandler, variantHandler *handler.VariantHandler, ingredientHandler *handler.IngredientHandler, orderHandler *handler.OrderHandler, shipperHandler *handler.ShipperHandler, deliveryHandler *handler.DeliveryHandler, adminUserHandler *handler.AdminUserHandler, wsHandler *handler.WebSocketHandler) {
	// Add WebSocket route (public, can add auth later)
	r.GET("/ws", wsHandler.HandleWebSocket)

	// API routes group
	api := r.Group("/api")
	{
		// Route verify token (public)
		api.POST("/auth/verify-token", adminHandler.VerifyToken)

		// Admin routes
		adminGroup := api.Group("/admin")
		{
			adminGroup.POST("/login", adminHandler.Login)

			// Protected admin routes
			adminProtected := adminGroup.Group("")
			adminProtected.Use(middleware.AuthMiddleware(jwtService))
			adminProtected.Use(middleware.AdminMiddleware())
			{
				// Setup all admin routes
				adminHandlers := &admin.AdminHandlers{
					ProductHandler:    productHandler,
					VariantHandler:    variantHandler,
					IngredientHandler: ingredientHandler,
					OrderHandler:      orderHandler,
					ShipperHandler:    shipperHandler,
					DeliveryHandler:   deliveryHandler,
					AdminUserHandler:  adminUserHandler,
				}
				admin.SetupAllAdminRoutes(adminProtected, adminHandlers)
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
