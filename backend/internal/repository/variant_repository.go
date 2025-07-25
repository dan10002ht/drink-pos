package repository

import (
	"context"
	"database/sql"

	"food-pos-backend/internal/model"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type VariantRepository struct {
	db *sqlx.DB
}

func NewVariantRepository(db *sqlx.DB) *VariantRepository {
	return &VariantRepository{db: db}
}

func (r *VariantRepository) CreateVariant(ctx context.Context, variant *model.Variant) error {
	query := `
		INSERT INTO variants (public_id, product_id, name, description, private_note, price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	variant.PublicID = uuid.New().String()
	return r.db.QueryRowContext(ctx, query,
		variant.PublicID,
		variant.ProductID,
		variant.Name,
		variant.Description,
		variant.PrivateNote,
		variant.Price,
		variant.CreatedAt,
		variant.UpdatedAt,
	).Scan(&variant.ID)
}

func (r *VariantRepository) GetByPublicID(ctx context.Context, publicID string) (*model.Variant, error) {
	query := `
		SELECT id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		FROM variants
		WHERE public_id = $1
	`
	var variant model.Variant
	err := r.db.GetContext(ctx, &variant, query, publicID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &variant, nil
}

func (r *VariantRepository) GetByID(ctx context.Context, id int64) (*model.Variant, error) {
	query := `
		SELECT id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		FROM variants
		WHERE id = $1
	`
	var variant model.Variant
	err := r.db.GetContext(ctx, &variant, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &variant, nil
}

func (r *VariantRepository) ListVariantsByProduct(ctx context.Context, productID int64) ([]*model.Variant, error) {
	query := `
		SELECT id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		FROM variants
		WHERE product_id = $1
		ORDER BY created_at ASC
	`
	var variants []*model.Variant
	err := r.db.SelectContext(ctx, &variants, query, productID)
	if err != nil {
		return nil, err
	}
	return variants, nil
}

func (r *VariantRepository) Update(ctx context.Context, variant *model.Variant) error {
	query := `
		UPDATE variants
		SET name = $1, description = $2, private_note = $3, price = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.ExecContext(ctx, query,
		variant.Name,
		variant.Description,
		variant.PrivateNote,
		variant.Price,
		variant.UpdatedAt,
		variant.ID,
	)
	return err
}

func (r *VariantRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM variants WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
} 