package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupOrderRoutes configures order routes
func SetupOrderRoutes(adminProtected *gin.RouterGroup, orderHandler *handler.OrderHandler) {
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
} 