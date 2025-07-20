package repository

import (
	"context"
	"fmt"

	"food-pos-backend/internal/model"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ShipperRepository struct {
	db *sqlx.DB
}

func NewShipperRepository(db *sqlx.DB) *ShipperRepository {
	return &ShipperRepository{db: db}
}

// CreateShipper creates a new shipper
func (r *ShipperRepository) CreateShipper(ctx context.Context, shipper *model.Shipper) error {
	query := `
		INSERT INTO shippers (
			public_id, name, phone, email, is_active, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		) RETURNING id`

	return r.db.GetContext(ctx, &shipper.ID, query,
		shipper.PublicID, shipper.Name, shipper.Phone, shipper.Email,
		shipper.IsActive, shipper.CreatedBy, shipper.CreatedAt, shipper.UpdatedAt,
	)
}

// GetShipperByID gets shipper by ID
func (r *ShipperRepository) GetShipperByID(ctx context.Context, id uuid.UUID) (*model.Shipper, error) {
	var shipper model.Shipper
	query := `SELECT * FROM shippers WHERE id = $1`
	err := r.db.GetContext(ctx, &shipper, query, id)
	if err != nil {
		return nil, err
	}
	return &shipper, nil
}

// GetShipperByPublicID gets shipper by public ID
func (r *ShipperRepository) GetShipperByPublicID(ctx context.Context, publicID uuid.UUID) (*model.Shipper, error) {
	var shipper model.Shipper
	query := `SELECT * FROM shippers WHERE public_id = $1`
	err := r.db.GetContext(ctx, &shipper, query, publicID)
	if err != nil {
		return nil, err
	}
	return &shipper, nil
}

// ListShippers lists shippers with pagination and filters
func (r *ShipperRepository) ListShippers(ctx context.Context, filters map[string]interface{}, page, limit int) ([]model.Shipper, int, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	// Add filters
	if isActive, ok := filters["is_active"].(bool); ok {
		whereClause += fmt.Sprintf(" AND is_active = $%d", argCount)
		args = append(args, isActive)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		whereClause += fmt.Sprintf(" AND (name ILIKE $%d OR phone ILIKE $%d OR email ILIKE $%d)", argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM shippers %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	// Get shippers
	query := fmt.Sprintf(`
		SELECT * FROM shippers 
		%s 
		ORDER BY created_at DESC 
		LIMIT $%d OFFSET $%d`, whereClause, argCount, argCount+1)
	
	args = append(args, limit, (page-1)*limit)
	
	var shippers []model.Shipper
	err = r.db.SelectContext(ctx, &shippers, query, args...)
	if err != nil {
		return nil, 0, err
	}

	return shippers, total, nil
}

// UpdateShipper updates shipper
func (r *ShipperRepository) UpdateShipper(ctx context.Context, shipper *model.Shipper) error {
	query := `
		UPDATE shippers SET 
			name = $1, phone = $2, email = $3, is_active = $4,
			updated_at = $5
		WHERE id = $6`

	_, err := r.db.ExecContext(ctx, query,
		shipper.Name, shipper.Phone, shipper.Email, shipper.IsActive,
		shipper.UpdatedAt, shipper.ID,
	)
	return err
}

// DeleteShipper deletes shipper
func (r *ShipperRepository) DeleteShipper(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM shippers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetActiveShippers gets all active shippers
func (r *ShipperRepository) GetActiveShippers(ctx context.Context) ([]model.Shipper, error) {
	var shippers []model.Shipper
	query := `SELECT * FROM shippers WHERE is_active = true ORDER BY name`
	
	err := r.db.SelectContext(ctx, &shippers, query)
	if err != nil {
		return nil, err
	}
	return shippers, nil
} 