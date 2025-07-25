package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupDeliveryRoutes configures delivery routes
func SetupDeliveryRoutes(adminProtected *gin.RouterGroup, deliveryHandler *handler.DeliveryHandler) {
	// Delivery routes
	adminProtected.POST("/deliveries", deliveryHandler.CreateDeliveryOrder)
	adminProtected.GET("/deliveries", deliveryHandler.ListDeliveryOrders)
	adminProtected.GET("/deliveries/:id", deliveryHandler.GetDeliveryOrderByID)
	adminProtected.PUT("/deliveries/:id", deliveryHandler.UpdateDeliveryOrder)
	adminProtected.PUT("/deliveries/:id/status", deliveryHandler.UpdateDeliveryStatus)
	adminProtected.GET("/deliveries/statuses", deliveryHandler.GetDeliveryStatuses)
	adminProtected.GET("/deliveries/shippers", deliveryHandler.GetAvailableShippers)

	// Order delivery routes
	adminProtected.POST("/orders/:id/assign-shipper", deliveryHandler.AssignShipperToOrder)
	adminProtected.POST("/orders/:id/split", deliveryHandler.SplitOrder)
	adminProtected.GET("/orders/:id/deliveries", deliveryHandler.GetDeliveryOrdersByOrderID)
} 