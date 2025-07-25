package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupAllAdminRoutes configures all admin routes
func SetupAllAdminRoutes(adminProtected *gin.RouterGroup, handlers *AdminHandlers) {
	SetupProductRoutes(adminProtected, handlers.ProductHandler, handlers.VariantHandler)
	SetupIngredientRoutes(adminProtected, handlers.IngredientHandler)
	SetupOrderRoutes(adminProtected, handlers.OrderHandler)
	SetupShipperRoutes(adminProtected, handlers.ShipperHandler)
	SetupDeliveryRoutes(adminProtected, handlers.DeliveryHandler)
	SetupUserRoutes(adminProtected, handlers.AdminUserHandler)
}

// AdminHandlers contains all admin handlers
type AdminHandlers struct {
	ProductHandler    *handler.ProductHandler
	VariantHandler    *handler.VariantHandler
	IngredientHandler *handler.IngredientHandler
	OrderHandler      *handler.OrderHandler
	ShipperHandler    *handler.ShipperHandler
	DeliveryHandler   *handler.DeliveryHandler
	AdminUserHandler  *handler.AdminUserHandler
} 