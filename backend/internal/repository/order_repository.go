package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"food-pos-backend/internal/model"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type OrderRepository struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) *OrderRepository {
	return &OrderRepository{
		db: db,
	}
}

// Helper: get real shipper id from public_id
func (r *OrderRepository) getShipperDBID(ctx context.Context, publicID *string) (*int64, error) {
	if publicID == nil || *publicID == "" {
		return nil, nil
	}
	var dbID int64
	err := r.db.QueryRowContext(ctx, "SELECT id FROM shippers WHERE public_id = $1", *publicID).Scan(&dbID)
	if err != nil {
		return nil, err
	}
	return &dbID, nil
}

// CreateOrder creates a new order with items
func (r *OrderRepository) CreateOrder(ctx context.Context, req *model.CreateOrderRequest, userID int64) (*model.Order, error) {
	// Start transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Create order
	var order model.Order
	orderQuery := `
		INSERT INTO orders (
			customer_name, customer_phone, customer_email, 
			discount_code, discount_type, discount_amount, discount_note, manual_discount_amount, shipping_fee,
			payment_method, notes, created_by, updated_by, items_count, shipper_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note, manual_discount_amount, shipping_fee,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at, items_count, shipper_id
	`
	var dbShipperID *int64
	if req.ShipperID != nil && *req.ShipperID != "" {
		dbShipperID, err = r.getShipperDBID(ctx, req.ShipperID)
		if err != nil {
			return nil, fmt.Errorf("invalid shipper_id: %w", err)
		}
	}


	err = tx.QueryRowContext(ctx, orderQuery,
		req.CustomerName, req.CustomerPhone, req.CustomerEmail,
		req.DiscountCode, req.DiscountType, req.DiscountAmount, req.DiscountNote, req.ManualDiscountAmount, req.ShippingFee,
		req.PaymentMethod, req.Notes, userID, userID, len(req.Items), dbShipperID,
	).Scan(
		&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote, &order.ManualDiscountAmount, &order.ShippingFee,
		&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
		&order.CreatedAt, &order.UpdatedAt, &order.ItemsCount, &order.ShipperID,
	)
	if err != nil {
		return nil, err
	}

	// Create order items
	items := make([]model.OrderItem, 0, len(req.Items))
	subtotal := 0.0

	for _, itemReq := range req.Items {
		// Get variant info
		var variantID, variantName, productName string
		var variantPrice float64
		variantQuery := `
			SELECT v.id, v.name, v.price, p.name as product_name
			FROM variants v
			JOIN products p ON v.product_id = p.id
			WHERE v.public_id = $1
		`
		err = tx.QueryRowContext(ctx, variantQuery, itemReq.VariantID).Scan(
			&variantID, &variantName, &variantPrice, &productName,
		)
		if err != nil {
			// Log the variant ID that was not found
			fmt.Printf("Variant not found: %s, Error: %v\n", itemReq.VariantID, err)
			return nil, fmt.Errorf("variant not found: %s", itemReq.VariantID)
		}

		// Create order item
		var item model.OrderItem
		itemQuery := `
			INSERT INTO order_items (
				order_id, variant_id, product_name, variant_name, 
				quantity, unit_price, total_price, notes
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id, order_id, variant_id, product_name, variant_name,
				quantity, unit_price, total_price, notes, created_at, updated_at
		`
		totalPrice := variantPrice * float64(itemReq.Quantity)
		subtotal += totalPrice

		err = tx.QueryRowContext(ctx, itemQuery,
			order.ID, variantID, productName, variantName,
			itemReq.Quantity, variantPrice, totalPrice, itemReq.Notes,
		).Scan(
			&item.ID, &item.OrderID, &item.VariantID, &item.ProductName, &item.VariantName,
			&item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.Notes, &item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("Failed to create order item: %v\n", err)
			return nil, err
		}
		items = append(items, item)
	}

	// Update order with calculated subtotal and total_amount
	updateOrderQuery := `
		UPDATE orders 
		SET subtotal = $1, total_amount = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $3, items_count = $4, shipper_id = $5
		WHERE id = $6
		RETURNING id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note, manual_discount_amount, shipping_fee,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at, items_count, shipper_id
	`
	// Calculate total amount considering discounts and shipping fee
	totalDiscount := order.DiscountAmount + order.ManualDiscountAmount
	totalAmount := math.Max(0, subtotal-totalDiscount+order.ShippingFee)
	
	err = tx.QueryRowContext(ctx, updateOrderQuery, subtotal, totalAmount, userID, len(req.Items), order.ShipperID, order.ID).Scan(
		&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote, &order.ManualDiscountAmount, &order.ShippingFee,
		&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
		&order.CreatedAt, &order.UpdatedAt, &order.ItemsCount, &order.ShipperID,
	)
	if err != nil {
		return nil, err
	}

	// Apply discount if discount code provided
	if req.DiscountCode != "" {
		err = r.applyDiscountCode(ctx, tx, &order, req.DiscountCode, userID)
		if err != nil {
			return nil, err
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	order.Items = items
	return &order, nil
}

// GetOrderByID gets order by public ID
func (r *OrderRepository) GetOrderByID(ctx context.Context, publicID string) (*model.Order, error) {
	// Get order + shipper (LEFT JOIN)
	var order model.Order
	var shipper model.Shipper
	orderQuery := `
		SELECT o.id, o.public_id, o.order_number, o.customer_name, o.customer_phone, o.customer_email,
			o.status, o.subtotal, o.discount_amount, o.discount_type, o.discount_code, o.discount_note, o.manual_discount_amount, o.shipping_fee,
			o.total_amount, o.payment_method, o.payment_status, o.notes, o.created_by, o.updated_by,
			o.created_at, o.updated_at, o.shipper_id, o.items_count,
			s.public_id, s.name, s.phone, s.email, s.is_active
		FROM orders o
		LEFT JOIN shippers s ON o.shipper_id = s.id
		WHERE o.public_id = $1
	`
	var shipperID sql.NullInt64
	var shipperPublicID sql.NullString
	var shipperName sql.NullString
	var shipperPhone sql.NullString
	var shipperEmail sql.NullString
	var shipperIsActive sql.NullBool
	err := r.db.QueryRowContext(ctx, orderQuery, publicID).Scan(
		&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote, &order.ManualDiscountAmount, &order.ShippingFee,
		&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
		&order.CreatedAt, &order.UpdatedAt, &shipperID, &order.ItemsCount,
		&shipperPublicID, &shipperName, &shipperPhone, &shipperEmail, &shipperIsActive,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("order not found")
		}
		return nil, err
	}
	if shipperPublicID.Valid {
		if uuidVal, err := uuid.Parse(shipperPublicID.String); err == nil {
			shipper.PublicID = uuidVal
		}
		shipper.Name = shipperName.String
		shipper.Phone = shipperPhone.String
		if shipperEmail.Valid {
			shipper.Email = &shipperEmail.String
		}
		shipper.IsActive = shipperIsActive.Bool
		order.Shipper = &shipper
	}

	// Get order items
	itemsQuery := `
		SELECT id, order_id, variant_id, product_name, variant_name,
			quantity, unit_price, total_price, notes, created_at, updated_at
		FROM order_items
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, itemsQuery, order.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.OrderItem
	for rows.Next() {
		var item model.OrderItem
		err := rows.Scan(
			&item.ID, &item.OrderID, &item.VariantID, &item.ProductName, &item.VariantName,
			&item.Quantity, &item.UnitPrice, &item.TotalPrice, &item.Notes, &item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	order.Items = items

	// Get status history
	historyQuery := `
		SELECT id, order_id, status, previous_status, notes, changed_by, created_at
		FROM order_status_history
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	historyRows, err := r.db.QueryContext(ctx, historyQuery, order.ID)
	if err != nil {
		return nil, err
	}
	defer historyRows.Close()

	var history []model.OrderStatusHistory
	for historyRows.Next() {
		var h model.OrderStatusHistory
		err := historyRows.Scan(
			&h.ID, &h.OrderID, &h.Status, &h.PreviousStatus, &h.Notes, &h.ChangedBy, &h.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		history = append(history, h)
	}
	order.StatusHistory = history

	return &order, nil
}

// UpdateOrderStatus updates order status
func (r *OrderRepository) UpdateOrderStatus(ctx context.Context, publicID string, status model.OrderStatus, notes string, userID int64) (*model.Order, error) {
	// Start transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Update order status
	updateQuery := `
		UPDATE orders 
		SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
		WHERE public_id = $3
		RETURNING id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at
	`
	var order model.Order
	err = tx.QueryRowContext(ctx, updateQuery, status, userID, publicID).Scan(
		&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote,
		&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
		&order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("order not found")
		}
		return nil, err
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &order, nil
}

// ListOrders lists orders with filtering and pagination
func (r *OrderRepository) ListOrders(ctx context.Context, req *model.ListOrdersRequest) (*model.ListOrdersResponse, error) {
	// Build query
	whereConditions := []string{"1=1"}
	args := []any{}
	argIndex := 1

	if req.Status != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *req.Status)
		argIndex++
	}

	if req.Search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(order_number ILIKE $%d OR customer_name ILIKE $%d OR customer_phone ILIKE $%d)",
			argIndex, argIndex, argIndex))
		args = append(args, "%"+req.Search+"%")
		argIndex++
	}

	if req.DateFrom != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("created_at >= $%d", argIndex))
		args = append(args, *req.DateFrom)
		argIndex++
	}

	if req.DateTo != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("created_at <= $%d", argIndex))
		args = append(args, *req.DateTo)
		argIndex++
	}

	whereClause := strings.Join(whereConditions, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM orders WHERE %s", whereClause)
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}
	page := req.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit
	pages := int(math.Ceil(float64(total) / float64(limit)))

	// Build sort
	sortBy := req.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	sortOrder := req.SortOrder
	if sortOrder == "" {
		sortOrder = "DESC"
	}
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "DESC"
	}

	// Get orders
	query := fmt.Sprintf(`
		SELECT id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at, items_count
		FROM orders
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	args = append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]*model.Order, 0)
	for rows.Next() {
		var order model.Order
		err := rows.Scan(
			&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
			&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote,
			&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
			&order.CreatedAt, &order.UpdatedAt, &order.ItemsCount,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, &order)
	}

	return &model.ListOrdersResponse{
		Orders: orders,
		Total:  total,
		Page:   page,
		Limit:  limit,
		Pages:  pages,
	}, nil
}

// ValidateDiscountCode validates and returns discount info
func (r *OrderRepository) ValidateDiscountCode(ctx context.Context, code string, orderAmount float64) (*model.ValidateDiscountCodeResponse, error) {
	var discountCode model.DiscountCode
	query := `
		SELECT id, code, name, discount_type, discount_value, min_order_amount, 
			max_discount_amount, usage_limit, used_count, is_active, valid_from, valid_until
		FROM discount_codes
		WHERE code = $1
	`
	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&discountCode.ID, &discountCode.Code, &discountCode.Name, &discountCode.DiscountType,
		&discountCode.DiscountValue, &discountCode.MinOrderAmount, &discountCode.MaxDiscountAmount,
		&discountCode.UsageLimit, &discountCode.UsedCount, &discountCode.IsActive,
		&discountCode.ValidFrom, &discountCode.ValidUntil,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &model.ValidateDiscountCodeResponse{
				IsValid: false,
				Message: "Mã giảm giá không tồn tại",
			}, nil
		}
		return nil, err
	}

	// Check if code is active
	if !discountCode.IsActive {
		return &model.ValidateDiscountCodeResponse{
			IsValid: false,
			Message: "Mã giảm giá đã bị vô hiệu hóa",
		}, nil
	}

	// Check validity period
	now := time.Now()
	if now.Before(discountCode.ValidFrom) {
		return &model.ValidateDiscountCodeResponse{
			IsValid: false,
			Message: "Mã giảm giá chưa có hiệu lực",
		}, nil
	}
	if now.After(discountCode.ValidUntil) {
		return &model.ValidateDiscountCodeResponse{
			IsValid: false,
			Message: "Mã giảm giá đã hết hạn",
		}, nil
	}

	// Check usage limit
	if discountCode.UsageLimit != nil && discountCode.UsedCount >= *discountCode.UsageLimit {
		return &model.ValidateDiscountCodeResponse{
			IsValid: false,
			Message: "Mã giảm giá đã hết lượt sử dụng",
		}, nil
	}

	// Check minimum order amount
	if orderAmount < discountCode.MinOrderAmount {
		return &model.ValidateDiscountCodeResponse{
			IsValid: false,
			Message: fmt.Sprintf("Đơn hàng tối thiểu %.0f VNĐ để áp dụng mã giảm giá", discountCode.MinOrderAmount),
		}, nil
	}

	// Calculate discount amount
	var discountAmount float64
	if discountCode.DiscountType == model.DiscountTypePercentage {
		discountAmount = orderAmount * (discountCode.DiscountValue / 100)
		if discountCode.MaxDiscountAmount != nil && discountAmount > *discountCode.MaxDiscountAmount {
			discountAmount = *discountCode.MaxDiscountAmount
		}
	} else {
		discountAmount = discountCode.DiscountValue
	}

	return &model.ValidateDiscountCodeResponse{
		IsValid:        true,
		Message:        "Mã giảm giá hợp lệ",
		DiscountType:   discountCode.DiscountType,
		DiscountValue:  discountCode.DiscountValue,
		DiscountAmount: discountAmount,
	}, nil
}

// applyDiscountCode applies discount to order
func (r *OrderRepository) applyDiscountCode(ctx context.Context, tx *sqlx.Tx, order *model.Order, code string, userID int64) error {
	// Validate discount code
	validation, err := r.ValidateDiscountCode(ctx, code, order.Subtotal)
	if err != nil {
		return err
	}
	if !validation.IsValid {
		return fmt.Errorf(validation.Message)
	}

	// Update order with discount
	updateQuery := `
		UPDATE orders 
		SET discount_amount = $1, discount_type = $2, discount_code = $3,
			total_amount = subtotal - $1, updated_at = CURRENT_TIMESTAMP, updated_by = $4
		WHERE id = $5
	`
	_, err = tx.ExecContext(ctx, updateQuery, validation.DiscountAmount, validation.DiscountType, code, userID, order.ID)
	if err != nil {
		return err
	}

	// Update order object
	order.DiscountAmount = validation.DiscountAmount
	order.DiscountType = &validation.DiscountType
	order.DiscountCode = code
	order.TotalAmount = order.Subtotal - validation.DiscountAmount

	// Increment usage count
	incrementQuery := `
		UPDATE discount_codes 
		SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE code = $1
	`
	_, err = tx.ExecContext(ctx, incrementQuery, code)
	if err != nil {
		return err
	}

	return nil
}

// UpdateOrder updates an existing order and its items
func (r *OrderRepository) UpdateOrder(ctx context.Context, publicID string, req *model.UpdateOrderRequest, userID int64) (*model.Order, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Lấy order id từ public_id
	var orderID int64
	err = tx.QueryRowContext(ctx, "SELECT id FROM orders WHERE public_id = $1", publicID).Scan(&orderID)
	if err != nil {
		return nil, err
	}

	// 2. Update bảng orders
	updateOrderQuery := `
		UPDATE orders 
		SET customer_name = $1, customer_phone = $2, customer_email = $3, discount_code = $4, discount_note = $5, payment_method = $6, notes = $7, updated_by = $8, updated_at = CURRENT_TIMESTAMP, shipper_id = $9
		WHERE id = $10
		RETURNING id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at, items_count, shipper_id
	`
	var order model.Order
	var dbShipperID *int64
	if req.ShipperID != nil && *req.ShipperID != "" {
		dbShipperID, err = r.getShipperDBID(ctx, req.ShipperID)
		if err != nil {
			return nil, fmt.Errorf("invalid shipper_id: %w", err)
		}
	}
	err = tx.QueryRowContext(ctx, updateOrderQuery,
		req.CustomerName, req.CustomerPhone, req.CustomerEmail, req.DiscountCode, req.DiscountNote, req.PaymentMethod, req.Notes, userID, dbShipperID, orderID,
	).Scan(
		&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote,
		&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
		&order.CreatedAt, &order.UpdatedAt, &order.ItemsCount, &order.ShipperID,
	)
	if err != nil {
		return nil, err
	}

	// 3. Lấy danh sách order_items cũ
	rows, err := tx.QueryContext(ctx, "SELECT id FROM order_items WHERE order_id = $1", orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	oldItemIDs := map[string]bool{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			oldItemIDs[id] = true
		}
	}

	// 4. Xử lý items mới
	newItemIDs := map[string]bool{}
	for _, item := range req.Items {
		if item.ID != "" {
			// Update
			// Lấy unit_price hiện tại của item
			var unitPrice float64
			err := tx.QueryRowContext(ctx, "SELECT unit_price FROM order_items WHERE id = $1", item.ID).Scan(&unitPrice)
			if err != nil {
				return nil, err
			}
			totalPrice := float64(item.Quantity) * unitPrice
			updateItemQuery := `
				UPDATE order_items SET
					quantity = $1, notes = $2, total_price = $3, updated_at = CURRENT_TIMESTAMP
				WHERE id = $4 AND order_id = $5
			`
			_, err = tx.ExecContext(ctx, updateItemQuery, item.Quantity, item.Notes, totalPrice, item.ID, orderID)
			if err != nil {
				return nil, err
			}
			newItemIDs[item.ID] = true
		} else {
			// Insert
			var variantID, productName, variantName string
			var unitPrice float64
			err := tx.QueryRowContext(ctx, `
				SELECT v.id, v.name, v.price, p.name
				FROM variants v JOIN products p ON v.product_id = p.id
				WHERE v.public_id = $1
			`, item.VariantID).Scan(&variantID, &variantName, &unitPrice, &productName)
			if err != nil {
				return nil, err
			}
			totalPrice := unitPrice * float64(item.Quantity)
			insertItemQuery := `
				INSERT INTO order_items (order_id, variant_id, product_name, variant_name, quantity, unit_price, total_price, notes)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			`
			_, err = tx.ExecContext(ctx, insertItemQuery,
				orderID, variantID, productName, variantName, item.Quantity, unitPrice, totalPrice, item.Notes,
			)
			if err != nil {
				return nil, err
			}
		}
	}

	// 5. Xóa các item không còn nữa
	for oldID := range oldItemIDs {
		if !newItemIDs[oldID] {
			_, err := tx.ExecContext(ctx, "DELETE FROM order_items WHERE id = $1", oldID)
			if err != nil {
				return nil, err
			}
		}
	}

	// 6. Cập nhật lại items_count
	_, err = tx.ExecContext(ctx, "UPDATE orders SET items_count = (SELECT COUNT(*) FROM order_items WHERE order_id = $1) WHERE id = $1", orderID)
	if err != nil {
		return nil, err
	}

	// 6. Commit transaction
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// 7. Trả về order mới nhất
	return r.GetOrderByID(ctx, publicID)
}

// GetOrderStatistics gets order statistics
func (r *OrderRepository) GetOrderStatistics(ctx context.Context, startDate, endDate *time.Time) (*model.OrderStatistics, error) {
	// Build date filter
	var dateFilter string
	var args []interface{}
	argCount := 1

	if startDate != nil && endDate != nil {
		dateFilter = "WHERE created_at >= $" + fmt.Sprint(argCount) + " AND created_at <= $" + fmt.Sprint(argCount+1)
		args = append(args, *startDate, *endDate)
		argCount += 2
	} else if startDate != nil {
		dateFilter = "WHERE created_at >= $" + fmt.Sprint(argCount)
		args = append(args, *startDate)
		argCount++
	} else if endDate != nil {
		dateFilter = "WHERE created_at <= $" + fmt.Sprint(argCount)
		args = append(args, *endDate)
		argCount++
	}

	// Get total orders and revenue
	var totalOrders int
	var totalRevenue float64
	statsQuery := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_orders,
			COALESCE(SUM(total_amount), 0) as total_revenue
		FROM orders
		%s
	`, dateFilter)

	err := r.db.QueryRowContext(ctx, statsQuery, args...).Scan(&totalOrders, &totalRevenue)
	if err != nil {
		return nil, err
	}

	// Calculate average order value
	var averageOrderValue float64
	if totalOrders > 0 {
		averageOrderValue = totalRevenue / float64(totalOrders)
	}

	// Get status counts
	statusQuery := fmt.Sprintf(`
		SELECT 
			status,
			COUNT(*) as count
		FROM orders
		%s
		GROUP BY status
	`, dateFilter)

	statusRows, err := r.db.QueryContext(ctx, statusQuery, args...)
	if err != nil {
		return nil, err
	}
	defer statusRows.Close()

	statusCounts := make(map[model.OrderStatus]int)
	for statusRows.Next() {
		var status model.OrderStatus
		var count int
		err := statusRows.Scan(&status, &count)
		if err != nil {
			return nil, err
		}
		statusCounts[status] = count
	}

	// Get recent orders
	recentQuery := fmt.Sprintf(`
		SELECT id, public_id, order_number, customer_name, customer_phone, customer_email,
			status, subtotal, discount_amount, discount_type, discount_code, discount_note,
			total_amount, payment_method, payment_status, notes, created_by, updated_by,
			created_at, updated_at
		FROM orders
		%s
		ORDER BY created_at DESC
		LIMIT 10
	`, dateFilter)

	recentRows, err := r.db.QueryContext(ctx, recentQuery, args...)
	if err != nil {
		return nil, err
	}
	defer recentRows.Close()

	var recentOrders []*model.Order
	for recentRows.Next() {
		var order model.Order
		err := recentRows.Scan(
			&order.ID, &order.PublicID, &order.OrderNumber, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
			&order.Status, &order.Subtotal, &order.DiscountAmount, &order.DiscountType, &order.DiscountCode, &order.DiscountNote,
			&order.TotalAmount, &order.PaymentMethod, &order.PaymentStatus, &order.Notes, &order.CreatedBy, &order.UpdatedBy,
			&order.CreatedAt, &order.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		recentOrders = append(recentOrders, &order)
	}

	stats := &model.OrderStatistics{
		TotalOrders:       totalOrders,
		TotalRevenue:      totalRevenue,
		AverageOrderValue: averageOrderValue,
		StatusCounts:      statusCounts,
		RecentOrders:      recentOrders,
	}

	return stats, nil
}
