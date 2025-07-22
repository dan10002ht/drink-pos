package ws

import (
	"sync"
)

type Hub struct {
	clients    map[*Client]bool
	groups     map[string]map[*Client]bool // group name (role) -> clients
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		groups:     make(map[string]map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if client.Role != "" {
				if h.groups[client.Role] == nil {
					h.groups[client.Role] = make(map[*Client]bool)
				}
				h.groups[client.Role][client] = true
			}
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				if client.Role != "" && h.groups[client.Role] != nil {
					delete(h.groups[client.Role], client)
				}
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
					if client.Role != "" && h.groups[client.Role] != nil {
						delete(h.groups[client.Role], client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) Broadcast(message []byte) {
	h.broadcast <- message
}

func (h *Hub) BroadcastToGroup(group string, message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for client := range h.groups[group] {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(h.clients, client)
			delete(h.groups[group], client)
		}
	}
}

// Thêm method Register và Unregister cho Hub
func (h *Hub) Register(client *Client) {
	h.register <- client
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
} 