package service

import (
	"context"
	"encoding/json"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/ws"
	"strconv"
	"time"
)

type DeliveryService struct {
	deliveryRepo *repository.DeliveryRepository
	orderRepo    *repository.OrderRepository
	hub          *ws.Hub
}

func NewDeliveryService(deliveryRepo *repository.DeliveryRepository, orderRepo *repository.OrderRepository, hub *ws.Hub) *DeliveryService {
	return &DeliveryService{
		deliveryRepo: deliveryRepo,
		orderRepo:    orderRepo,
		hub:          hub,
	}
}

// CreateDeliveryOrder creates a new delivery order
func (s *DeliveryService) CreateDeliveryOrder(ctx context.Context, req *model.CreateDeliveryOrderRequest, userID int64) (*model.DeliveryOrder, error) {
	// Validate request
	if err := s.validateCreateDeliveryOrderRequest(req); err != nil {
		return nil, err
	}

	// Create delivery order
	deliveryOrder, err := s.deliveryRepo.CreateDeliveryOrder(ctx, req, userID)
	if err != nil {
		return nil, err
	}

	// Emit event
	if s.hub != nil {
		event := ws.Event{
			Type:    ws.EventDeliveryUpdate,
			Payload: deliveryOrder,
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}

	return deliveryOrder, nil
}

// GetDeliveryOrderByID gets delivery order by public ID
func (s *DeliveryService) GetDeliveryOrderByID(ctx context.Context, publicID string) (*model.DeliveryOrder, error) {
	return s.deliveryRepo.GetDeliveryOrderByID(ctx, publicID)
}

// UpdateDeliveryOrder updates delivery order
func (s *DeliveryService) UpdateDeliveryOrder(ctx context.Context, publicID string, req *model.UpdateDeliveryOrderRequest, userID int64) (*model.DeliveryOrder, error) {
	// Validate request
	if err := s.validateUpdateDeliveryOrderRequest(req); err != nil {
		return nil, err
	}

	// Update delivery order
	deliveryOrder, err := s.deliveryRepo.UpdateDeliveryOrder(ctx, publicID, req, userID)
	if err != nil {
		return nil, err
	}

	// Emit event
	if s.hub != nil {
		event := ws.Event{
			Type:    ws.EventDeliveryUpdate,
			Payload: deliveryOrder,
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}

	return deliveryOrder, nil
}

// ListDeliveryOrders lists delivery orders with filtering
func (s *DeliveryService) ListDeliveryOrders(ctx context.Context, req *model.ListDeliveryOrdersRequest) (*model.ListDeliveryOrdersResponse, error) {
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

	return s.deliveryRepo.ListDeliveryOrders(ctx, req)
}

// AssignShipperToOrder assigns a shipper to an order (simple assignment)
func (s *DeliveryService) AssignShipperToOrder(ctx context.Context, orderID string, req *model.AssignShipperRequest, userID int64) error {
	// Validate request
	if err := s.validateAssignShipperRequest(req); err != nil {
		return err
	}

	// Check if order exists and is ready for delivery
	order, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status != model.OrderStatusReadyForDelivery && order.Status != model.OrderStatusCompleted {
		return model.NewValidationError("status", "Đơn hàng phải ở trạng thái sẵn sàng giao hàng hoặc đã hoàn thành")
	}

	// If split order is requested, create delivery orders
	if req.SplitOrder {
		return s.createSplitDeliveries(ctx, orderID, req, userID)
	}

	// Simple assignment
	err = s.deliveryRepo.AssignShipperToOrder(ctx, order.PublicID, req.ShipperID, userID)
	if err != nil {
		return err
	}

	// Emit event
	if s.hub != nil {
		event := ws.Event{
			Type: ws.EventOrderUpdate,
			Payload: map[string]interface{}{
				"order_id":   orderID,
				"shipper_id": req.ShipperID,
				"action":     "shipper_assigned",
			},
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}

	return nil
}

// SplitOrder splits an order into multiple delivery orders
func (s *DeliveryService) SplitOrder(ctx context.Context, orderID string, req *model.SplitOrderRequest, userID int64) error {
	// Validate request
	if err := s.validateSplitOrderRequest(req); err != nil {
		return err
	}

	// Check if order exists and is ready for delivery
	order, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status != model.OrderStatusReadyForDelivery && order.Status != model.OrderStatusCompleted {
		return model.NewValidationError("status", "Đơn hàng phải ở trạng thái sẵn sàng giao hàng hoặc đã hoàn thành")
	}

	// Create delivery orders
	for _, delivery := range req.Deliveries {
		delivery.OrderID = order.PublicID
		_, err := s.deliveryRepo.CreateDeliveryOrder(ctx, &delivery, userID)
		if err != nil {
			return err
		}
	}

	// Emit event
	if s.hub != nil {
		event := ws.Event{
			Type: ws.EventOrderUpdate,
			Payload: map[string]interface{}{
				"order_id": orderID,
				"action":   "order_split",
			},
		}
		if data, err := json.Marshal(event); err == nil {
			s.hub.BroadcastToGroup("admin", data)
		}
	}

	return nil
}

// GetDeliveryOrdersByOrderID gets all delivery orders for a specific order
func (s *DeliveryService) GetDeliveryOrdersByOrderID(ctx context.Context, orderID string) ([]*model.DeliveryOrder, error) {
	return s.deliveryRepo.GetDeliveryOrdersByOrderID(ctx, orderID)
}

// GetAvailableShippers gets all active shippers
func (s *DeliveryService) GetAvailableShippers(ctx context.Context) ([]*model.Shipper, error) {
	return s.deliveryRepo.GetAvailableShippers(ctx)
}

// UpdateDeliveryStatus updates delivery status
func (s *DeliveryService) UpdateDeliveryStatus(ctx context.Context, deliveryID string, status model.DeliveryStatus, notes string, userID int64) (*model.DeliveryOrder, error) {
	req := &model.UpdateDeliveryOrderRequest{
		Status:        &status,
		DeliveryNotes: notes,
	}

	// If status is delivered, set actual delivery time
	if status == model.DeliveryStatusDelivered {
		now := time.Now()
		req.ActualDeliveryTime = &now
	}

	return s.UpdateDeliveryOrder(ctx, deliveryID, req, userID)
}

// Helper methods

func (s *DeliveryService) validateCreateDeliveryOrderRequest(req *model.CreateDeliveryOrderRequest) error {
	if req.OrderID == "" {
		return model.NewValidationError("order_id", "Order ID is required")
	}
	if req.ShipperID == "" {
		return model.NewValidationError("shipper_id", "Shipper ID is required")
	}
	if len(req.Items) == 0 {
		return model.NewValidationError("items", "At least one item is required")
	}
	return nil
}

func (s *DeliveryService) validateUpdateDeliveryOrderRequest(req *model.UpdateDeliveryOrderRequest) error {
	// Add validation logic if needed
	return nil
}

func (s *DeliveryService) validateAssignShipperRequest(req *model.AssignShipperRequest) error {
	if req.ShipperID == "" {
		return model.NewValidationError("shipper_id", "Shipper ID is required")
	}
	return nil
}

func (s *DeliveryService) validateSplitOrderRequest(req *model.SplitOrderRequest) error {
	if len(req.Deliveries) == 0 {
		return model.NewValidationError("deliveries", "At least one delivery is required")
	}
	return nil
}

func (s *DeliveryService) createSplitDeliveries(ctx context.Context, orderID string, req *model.AssignShipperRequest, userID int64) error {
	// Get order items
	order, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if err != nil {
		return err
	}

	// Create a single delivery order with all items
	var items []model.DeliveryItemRequest
	for _, item := range order.Items {
		items = append(items, model.DeliveryItemRequest{
			OrderItemID: strconv.FormatInt(item.ID, 10),
			Quantity:    item.Quantity,
		})
	}

	deliveryReq := &model.CreateDeliveryOrderRequest{
		OrderID:               order.PublicID,
		ShipperID:             req.ShipperID,
		EstimatedDeliveryTime: req.EstimatedDeliveryTime,
		DeliveryNotes:         req.DeliveryNotes,
		Items:                 items,
	}

	_, err = s.deliveryRepo.CreateDeliveryOrder(ctx, deliveryReq, userID)
	return err
}
