package service

import (
	"context"
	"encoding/json"
	"fmt"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/ws"
	"time"
)

type OrderService struct {
	orderRepo *repository.OrderRepository
	hub       *ws.Hub
	userRepo  *repository.UserRepository
}

func NewOrderService(orderRepo *repository.OrderRepository, userRepo *repository.UserRepository, hub *ws.Hub) *OrderService {
	return &OrderService{
		orderRepo: orderRepo,
		hub:       hub,
		userRepo:  userRepo,
	}
}

// CreateOrder creates a new order
func (s *OrderService) CreateOrder(ctx context.Context, req *model.CreateOrderRequest, userID int64) (*model.Order, error) {
	// Validate request
	if err := s.validateCreateOrderRequest(req); err != nil {
		fmt.Println("Error validateCreateOrderRequest:", err)
		return nil, err
	}

	// Nếu userID rỗng, tìm hoặc tạo user guest
	if userID == 0 {
		user, err := s.userRepo.FindOrCreateUserByInfo(req.CustomerName, req.CustomerPhone, req.CustomerEmail)
		if err != nil {
			return nil, err
		}
		userID = user.ID
	}

	// Create order
	order, err := s.orderRepo.CreateOrder(ctx, req, userID)
	if err != nil {
		fmt.Println("Error CreateOrder:", err)
		return nil, err
	}
	// Emit event order_update
	if s.hub != nil {
		event := ws.Event{
			Type:    ws.EventOrderUpdate,
			Payload: order,
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}
	return order, nil
}

// GetOrderByID gets order by public ID
func (s *OrderService) GetOrderByID(ctx context.Context, publicID string) (*model.Order, error) {
	order, err := s.orderRepo.GetOrderByID(ctx, publicID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

// UpdateOrderStatus updates order status
func (s *OrderService) UpdateOrderStatus(ctx context.Context, publicID string, req *model.UpdateOrderStatusRequest, userID int64) (*model.Order, error) {
	// Validate status transition
	if err := s.validateStatusTransition(ctx, publicID, req.Status); err != nil {
		return nil, err
	}

	// Update status
	order, err := s.orderRepo.UpdateOrderStatus(ctx, publicID, req.Status, req.Notes, userID)
	if err != nil {
		return nil, err
	}
	// Emit event order_update
	if s.hub != nil {
		event := ws.Event{
			Type:    ws.EventOrderUpdate,
			Payload: order,
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}
	return order, nil
}

// UpdateOrder updates an existing order
func (s *OrderService) UpdateOrder(ctx context.Context, publicID string, req *model.UpdateOrderRequest, userID int64) (*model.Order, error) {
	return s.orderRepo.UpdateOrder(ctx, publicID, req, userID)
}

// ListOrders lists orders with filtering and pagination
func (s *OrderService) ListOrders(ctx context.Context, req *model.ListOrdersRequest) (*model.ListOrdersResponse, error) {
	// Set default values
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	// Get orders
	response, err := s.orderRepo.ListOrders(ctx, req)
	if err != nil {
		return nil, err
	}

	return response, nil
}

// ValidateDiscountCode validates discount code
func (s *OrderService) ValidateDiscountCode(ctx context.Context, req *model.ValidateDiscountCodeRequest) (*model.ValidateDiscountCodeResponse, error) {
	validation, err := s.orderRepo.ValidateDiscountCode(ctx, req.Code, req.OrderAmount)
	if err != nil {
		return nil, err
	}

	return validation, nil
}

// GetOrderStatistics gets order statistics
func (s *OrderService) GetOrderStatistics(ctx context.Context, startDate, endDate *time.Time) (*model.OrderStatistics, error) {
	stats, err := s.orderRepo.GetOrderStatistics(ctx, startDate, endDate)
	if err != nil {
		return nil, err
	}
	return stats, nil
}

// validateCreateOrderRequest validates create order request
func (s *OrderService) validateCreateOrderRequest(req *model.CreateOrderRequest) error {
	// Check if items are provided
	if len(req.Items) == 0 {
		return model.NewValidationError("items", "Phải có ít nhất 1 sản phẩm trong đơn hàng")
	}

	// Validate discount logic
	if req.DiscountCode != "" && req.ManualDiscountAmount > 0 {
		return model.NewValidationError("discount", "Không thể áp dụng cả mã giảm giá và giảm giá thủ công cùng lúc")
	}

	// Validate manual discount
	if req.ManualDiscountAmount > 0 {
		if req.DiscountType == nil {
			return model.NewValidationError("discount_type", "Phải chọn loại giảm giá khi áp dụng giảm giá thủ công")
		}
		if req.DiscountAmount <= 0 {
			return model.NewValidationError("discount_amount", "Giá trị giảm giá phải lớn hơn 0")
		}
	}

	return nil
}

// validateStatusTransition validates order status transition
func (s *OrderService) validateStatusTransition(ctx context.Context, orderID string, newStatus model.OrderStatus) error {
	// Get current order
	order, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return err
	}

	// Define valid status transitions
	validTransitions := map[model.OrderStatus][]model.OrderStatus{
		model.OrderStatusPending: {
			model.OrderStatusProcessing,
			model.OrderStatusCancelled,
		},
		model.OrderStatusProcessing: {
			model.OrderStatusCompleted,
			model.OrderStatusReadyForDelivery,
			model.OrderStatusCancelled,
		},
		model.OrderStatusCompleted: {
			model.OrderStatusReadyForDelivery,
		},
		model.OrderStatusReadyForDelivery: {
			model.OrderStatusCompleted,
			model.OrderStatusCancelled,
		},
		model.OrderStatusCancelled: {
			// Cannot transition from cancelled
		},
	}

	// Check if transition is valid
	allowedStatuses, exists := validTransitions[order.Status]
	if !exists {
		return model.NewValidationError("status", "Trạng thái hiện tại không hợp lệ")
	}

	isValid := false
	for _, allowedStatus := range allowedStatuses {
		if allowedStatus == newStatus {
			isValid = true
			break
		}
	}

	if !isValid {
		return model.NewValidationError("status", "Không thể chuyển từ trạng thái "+string(order.Status)+" sang "+string(newStatus))
	}

	return nil
}
