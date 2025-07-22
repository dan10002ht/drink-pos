package handler

import (
	"food-pos-backend/internal/ws"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub *ws.Hub
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Can customize for security
	},
}

func NewWebSocketHandler(hub *ws.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

// WebSocketHandler handles websocket requests
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// Log thông tin request
	log.Printf("[WebSocket] New connection attempt: remote=%s, origin=%s, url=%s, user-agent=%s", c.Request.RemoteAddr, c.Request.Header.Get("Origin"), c.Request.URL.String(), c.Request.UserAgent())

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade to WebSocket"})
		return
	}
	log.Printf("[WebSocket] Upgrade success: remote=%s, url=%s", c.Request.RemoteAddr, c.Request.URL.String())

	role := c.Query("role") // Lấy role từ query param

	client := &ws.Client{
		Hub:  h.hub,
		Conn: conn,
		Send: make(chan []byte, 256),
		Role: role,
		// UserID: có thể lấy từ context nếu cần phân quyền
	}
	h.hub.Register(client)

	// Goroutine đọc và ghi message
	go client.WritePump()
	go client.ReadPump()
}