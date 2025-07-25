package admin

import (
	"food-pos-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configures user management routes
func SetupUserRoutes(adminProtected *gin.RouterGroup, adminUserHandler *handler.AdminUserHandler) {
	// User management routes
	adminProtected.GET("/users", adminUserHandler.GetUsers)
	adminProtected.GET("/users/:id", adminUserHandler.GetUser)
	adminProtected.POST("/users", adminUserHandler.CreateUser)
	adminProtected.PUT("/users/:id", adminUserHandler.UpdateUser)
	adminProtected.DELETE("/users/:id", adminUserHandler.DeleteUser)
} 