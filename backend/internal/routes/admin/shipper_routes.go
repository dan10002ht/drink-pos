package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupShipperRoutes configures shipper routes
func SetupShipperRoutes(adminProtected *gin.RouterGroup, shipperHandler *handler.ShipperHandler) {
	// Shipper routes
	adminProtected.POST("/shippers", shipperHandler.CreateShipper)
	adminProtected.GET("/shippers", shipperHandler.ListShippers)
	adminProtected.GET("/shippers/:id", shipperHandler.GetShipper)
	adminProtected.PUT("/shippers/:id", shipperHandler.UpdateShipper)
	adminProtected.DELETE("/shippers/:id", shipperHandler.DeleteShipper)
	adminProtected.GET("/shippers/active", shipperHandler.GetActiveShippers)
} 