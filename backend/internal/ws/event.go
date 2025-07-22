package ws

type EventType string

const (
	EventOrderUpdate   EventType = "order_update"
	EventNotification  EventType = "notification"
	// Có thể mở rộng thêm các event khác sau này
)

type Event struct {
	Type    EventType   `json:"type"`
	Payload any `json:"payload"`
} 