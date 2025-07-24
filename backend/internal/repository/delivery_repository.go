package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"food-pos-backend/internal/model"

	"github.com/jmoiron/sqlx"
)

type DeliveryRepository struct {
	db *sqlx.DB
}

func NewDeliveryRepository(db *sqlx.DB) *DeliveryRepository {
	return &DeliveryRepository{
		db: db,
	}
}

// CreateDeliveryOrder creates a new delivery order
func (r *DeliveryRepository) CreateDeliveryOrder(ctx context.Context, req *model.CreateDeliveryOrderRequest, userID string) (*model.DeliveryOrder, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Create delivery order
	var deliveryOrder model.DeliveryOrder
	deliveryQuery := `
		INSERT INTO delivery_orders (
			order_id, shipper_id, estimated_delivery_time, delivery_notes, created_by, updated_by
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, public_id, order_id, shipper_id, delivery_number, status,
			estimated_delivery_time, actual_delivery_time, delivery_notes,
			created_by, updated_by, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, deliveryQuery,
		req.OrderID, req.ShipperID, req.EstimatedDeliveryTime, req.DeliveryNotes, userID, userID,
	).Scan(
		&deliveryOrder.ID, &deliveryOrder.PublicID, &deliveryOrder.OrderID, &deliveryOrder.ShipperID,
		&deliveryOrder.DeliveryNumber, &deliveryOrder.Status, &deliveryOrder.EstimatedDeliveryTime,
		&deliveryOrder.ActualDeliveryTime, &deliveryOrder.DeliveryNotes, &deliveryOrder.CreatedBy,
		&deliveryOrder.UpdatedBy, &deliveryOrder.CreatedAt, &deliveryOrder.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Create delivery order items
	items := make([]model.DeliveryOrderItem, 0, len(req.Items))
	for _, item := range req.Items {
		var deliveryItem model.DeliveryOrderItem
		itemQuery := `
			INSERT INTO delivery_order_items (delivery_order_id, order_item_id, quantity)
			VALUES ($1, $2, $3)
			RETURNING id, delivery_order_id, order_item_id, quantity, created_at
		`
		err = tx.QueryRowContext(ctx, itemQuery, deliveryOrder.ID, item.OrderItemID, item.Quantity).Scan(
			&deliveryItem.ID, &deliveryItem.DeliveryOrderID, &deliveryItem.OrderItemID,
			&deliveryItem.Quantity, &deliveryItem.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, deliveryItem)
	}

	// Update delivery order status to assigned
	updateQuery := `
		UPDATE delivery_orders 
		SET status = 'assigned', updated_at = CURRENT_TIMESTAMP, updated_by = $1
		WHERE id = $2
	`
	_, err = tx.ExecContext(ctx, updateQuery, userID, deliveryOrder.ID)
	if err != nil {
		return nil, err
	}
	deliveryOrder.Status = model.DeliveryStatusAssigned

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	deliveryOrder.DeliveryOrderItems = items
	return &deliveryOrder, nil
}

// GetDeliveryOrderByID gets delivery order by public ID
func (r *DeliveryRepository) GetDeliveryOrderByID(ctx context.Context, publicID string) (*model.DeliveryOrder, error) {
	query := `
		SELECT id, public_id, order_id, shipper_id, delivery_number, status,
			estimated_delivery_time, actual_delivery_time, delivery_notes,
			created_by, updated_by, created_at, updated_at
		FROM delivery_orders
		WHERE public_id = $1
	`
	var deliveryOrder model.DeliveryOrder
	err := r.db.QueryRowContext(ctx, query, publicID).Scan(
		&deliveryOrder.ID, &deliveryOrder.PublicID, &deliveryOrder.OrderID, &deliveryOrder.ShipperID,
		&deliveryOrder.DeliveryNumber, &deliveryOrder.Status, &deliveryOrder.EstimatedDeliveryTime,
		&deliveryOrder.ActualDeliveryTime, &deliveryOrder.DeliveryNotes, &deliveryOrder.CreatedBy,
		&deliveryOrder.UpdatedBy, &deliveryOrder.CreatedAt, &deliveryOrder.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("delivery order not found")
		}
		return nil, err
	}

	// Get delivery order items
	itemsQuery := `
		SELECT id, delivery_order_id, order_item_id, quantity, created_at
		FROM delivery_order_items
		WHERE delivery_order_id = $1
	`
	rows, err := r.db.QueryContext(ctx, itemsQuery, deliveryOrder.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.DeliveryOrderItem
	for rows.Next() {
		var item model.DeliveryOrderItem
		err := rows.Scan(&item.ID, &item.DeliveryOrderID, &item.OrderItemID, &item.Quantity, &item.CreatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	deliveryOrder.DeliveryOrderItems = items

	return &deliveryOrder, nil
}

// UpdateDeliveryOrder updates delivery order
func (r *DeliveryRepository) UpdateDeliveryOrder(ctx context.Context, publicID string, req *model.UpdateDeliveryOrderRequest, userID string) (*model.DeliveryOrder, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Build update query dynamically
	updateFields := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.ShipperID != nil {
		updateFields = append(updateFields, fmt.Sprintf("shipper_id = $%d", argIndex))
		args = append(args, *req.ShipperID)
		argIndex++
	}

	if req.Status != nil {
		updateFields = append(updateFields, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *req.Status)
		argIndex++
	}

	if req.EstimatedDeliveryTime != nil {
		updateFields = append(updateFields, fmt.Sprintf("estimated_delivery_time = $%d", argIndex))
		args = append(args, *req.EstimatedDeliveryTime)
		argIndex++
	}

	if req.ActualDeliveryTime != nil {
		updateFields = append(updateFields, fmt.Sprintf("actual_delivery_time = $%d", argIndex))
		args = append(args, *req.ActualDeliveryTime)
		argIndex++
	}

	updateFields = append(updateFields, fmt.Sprintf("delivery_notes = $%d", argIndex))
	args = append(args, req.DeliveryNotes)
	argIndex++

	updateFields = append(updateFields, fmt.Sprintf("updated_by = $%d, updated_at = CURRENT_TIMESTAMP", argIndex))
	args = append(args, userID)
	argIndex++

	args = append(args, publicID)

	query := fmt.Sprintf(`
		UPDATE delivery_orders 
		SET %s
		WHERE public_id = $%d
		RETURNING id, public_id, order_id, shipper_id, delivery_number, status,
			estimated_delivery_time, actual_delivery_time, delivery_notes,
			created_by, updated_by, created_at, updated_at
	`, updateFields, argIndex)

	var deliveryOrder model.DeliveryOrder
	err = tx.QueryRowContext(ctx, query, args...).Scan(
		&deliveryOrder.ID, &deliveryOrder.PublicID, &deliveryOrder.OrderID, &deliveryOrder.ShipperID,
		&deliveryOrder.DeliveryNumber, &deliveryOrder.Status, &deliveryOrder.EstimatedDeliveryTime,
		&deliveryOrder.ActualDeliveryTime, &deliveryOrder.DeliveryNotes, &deliveryOrder.CreatedBy,
		&deliveryOrder.UpdatedBy, &deliveryOrder.CreatedAt, &deliveryOrder.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("delivery order not found")
		}
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &deliveryOrder, nil
}

// ListDeliveryOrders lists delivery orders with filtering
func (r *DeliveryRepository) ListDeliveryOrders(ctx context.Context, req *model.ListDeliveryOrdersRequest) (*model.ListDeliveryOrdersResponse, error) {
	// Build query with filters
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if req.OrderID != "" {
		whereClause += fmt.Sprintf(" AND order_id = $%d", argIndex)
		args = append(args, req.OrderID)
		argIndex++
	}

	if req.ShipperID != "" {
		whereClause += fmt.Sprintf(" AND shipper_id = $%d", argIndex)
		args = append(args, req.ShipperID)
		argIndex++
	}

	if req.Status != nil {
		whereClause += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, *req.Status)
		argIndex++
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM delivery_orders %s", whereClause)
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	offset := (req.Page - 1) * req.Limit
	args = append(args, req.Limit, offset)

	// Get delivery orders
	query := fmt.Sprintf(`
		SELECT id, public_id, order_id, shipper_id, delivery_number, status,
			estimated_delivery_time, actual_delivery_time, delivery_notes,
			created_by, updated_by, created_at, updated_at
		FROM delivery_orders
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deliveryOrders []*model.DeliveryOrder
	for rows.Next() {
		var deliveryOrder model.DeliveryOrder
		err := rows.Scan(
			&deliveryOrder.ID, &deliveryOrder.PublicID, &deliveryOrder.OrderID, &deliveryOrder.ShipperID,
			&deliveryOrder.DeliveryNumber, &deliveryOrder.Status, &deliveryOrder.EstimatedDeliveryTime,
			&deliveryOrder.ActualDeliveryTime, &deliveryOrder.DeliveryNotes, &deliveryOrder.CreatedBy,
			&deliveryOrder.UpdatedBy, &deliveryOrder.CreatedAt, &deliveryOrder.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		deliveryOrders = append(deliveryOrders, &deliveryOrder)
	}

	pages := (total + req.Limit - 1) / req.Limit

	return &model.ListDeliveryOrdersResponse{
		DeliveryOrders: deliveryOrders,
		Total:          total,
		Page:           req.Page,
		Limit:          req.Limit,
		Pages:          pages,
	}, nil
}

// GetDeliveryOrdersByOrderID gets all delivery orders for a specific order
func (r *DeliveryRepository) GetDeliveryOrdersByOrderID(ctx context.Context, orderID string) ([]*model.DeliveryOrder, error) {
	query := `
		SELECT id, public_id, order_id, shipper_id, delivery_number, status,
			estimated_delivery_time, actual_delivery_time, delivery_notes,
			created_by, updated_by, created_at, updated_at
		FROM delivery_orders
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deliveryOrders []*model.DeliveryOrder
	for rows.Next() {
		var deliveryOrder model.DeliveryOrder
		err := rows.Scan(
			&deliveryOrder.ID, &deliveryOrder.PublicID, &deliveryOrder.OrderID, &deliveryOrder.ShipperID,
			&deliveryOrder.DeliveryNumber, &deliveryOrder.Status, &deliveryOrder.EstimatedDeliveryTime,
			&deliveryOrder.ActualDeliveryTime, &deliveryOrder.DeliveryNotes, &deliveryOrder.CreatedBy,
			&deliveryOrder.UpdatedBy, &deliveryOrder.CreatedAt, &deliveryOrder.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		deliveryOrders = append(deliveryOrders, &deliveryOrder)
	}

	return deliveryOrders, nil
}

// AssignShipperToOrder assigns a shipper to an order (simple assignment)
func (r *DeliveryRepository) AssignShipperToOrder(ctx context.Context, orderID string, shipperID string, userID string) error {
	query := `
		UPDATE orders 
		SET shipper_id = $1, delivery_status = 'assigned', updated_by = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, shipperID, userID, orderID)
	return err
}

// GetAvailableShippers gets all active shippers
func (r *DeliveryRepository) GetAvailableShippers(ctx context.Context) ([]*model.Shipper, error) {
	query := `
		SELECT id, public_id, name, phone, email, is_active, created_by, created_at, updated_at
		FROM shippers
		WHERE is_active = true
		ORDER BY name ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shippers []*model.Shipper
	for rows.Next() {
		var shipper model.Shipper
		err := rows.Scan(
			&shipper.ID, &shipper.PublicID, &shipper.Name, &shipper.Phone, &shipper.Email,
			&shipper.IsActive, &shipper.CreatedBy, &shipper.CreatedAt, &shipper.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		shippers = append(shippers, &shipper)
	}

	return shippers, nil
}
