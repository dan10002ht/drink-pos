package handler

import (
	"food-pos-backend/internal/service"
	"food-pos-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	ExampleService *service.ExampleService
}

func NewHandler() *Handler {
	return &Handler{
		ExampleService: service.NewExampleService(),
	}
}

func (h *Handler) GetExample(c *gin.Context) {
	result := h.ExampleService.GetExample()
	response.Success(c, gin.H{"data": result}, "Example data retrieved successfully")
} 