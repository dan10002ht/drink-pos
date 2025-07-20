package handler

import (
	"fmt"
	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	adminService *service.AdminService
}

func NewAdminHandler(jwtService *jwt.JWTService) *AdminHandler {
	return &AdminHandler{
		adminService: service.NewAdminService(jwtService),
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// POST /api/admin/login
func (h *AdminHandler) Login(c *gin.Context) {
	var req LoginRequest
	fmt.Println("Login request received")
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body")
		return
	}
	token, err := h.adminService.Login(req.Username, req.Password)
	if err != nil {
		response.Error(c, 401, err.Error())
		return
	}
	response.Success(c, gin.H{"token": token}, "Admin login successful")
} 