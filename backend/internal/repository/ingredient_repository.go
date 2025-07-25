package repository

import (
	"context"
	"database/sql"
	"time"

	"food-pos-backend/internal/model"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type IngredientRepository struct {
	db *sqlx.DB
}

func NewIngredientRepository(db *sqlx.DB) *IngredientRepository {
	return &IngredientRepository{db: db}
}

func (r *IngredientRepository) Create(ctx context.Context, ingredient *model.Ingredient) error {
	query := `
		INSERT INTO ingredients (public_id, name, unit_price, unit, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	ingredient.PublicID = uuid.New().String()
	return r.db.QueryRowContext(ctx, query,
		ingredient.PublicID,
		ingredient.Name,
		ingredient.UnitPrice,
		ingredient.Unit,
		ingredient.CreatedAt,
		ingredient.UpdatedAt,
	).Scan(&ingredient.ID)
}

func (r *IngredientRepository) GetByID(ctx context.Context, id int64) (*model.Ingredient, error) {
	query := `
		SELECT id, public_id, name, unit_price, unit, created_at, updated_at
		FROM ingredients
		WHERE id = $1
	`
	var ingredient model.Ingredient
	err := r.db.GetContext(ctx, &ingredient, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &ingredient, nil
}

func (r *IngredientRepository) GetByPublicID(ctx context.Context, publicID string) (*model.Ingredient, error) {
	query := `
		SELECT id, public_id, name, unit_price, unit, created_at, updated_at
		FROM ingredients
		WHERE public_id = $1
	`
	
	var ingredient model.Ingredient
	err := r.db.GetContext(ctx, &ingredient, query, publicID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	return &ingredient, nil
}

func (r *IngredientRepository) GetAll(ctx context.Context) ([]*model.Ingredient, error) {
	query := `
		SELECT id, public_id, name, unit_price, unit, created_at, updated_at
		FROM ingredients
		ORDER BY name
	`
	
	var ingredients []*model.Ingredient
	err := r.db.SelectContext(ctx, &ingredients, query)
	if err != nil {
		return nil, err
	}
	
	return ingredients, nil
}

func (r *IngredientRepository) Update(ctx context.Context, ingredient *model.Ingredient) error {
	query := `
		UPDATE ingredients
		SET name = $1, unit_price = $2, unit = $3, updated_at = $4
		WHERE id = $5
	`
	
	_, err := r.db.ExecContext(ctx, query,
		ingredient.Name,
		ingredient.UnitPrice,
		ingredient.Unit,
		ingredient.UpdatedAt,
		ingredient.ID,
	)
	
	return err
}

func (r *IngredientRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM ingredients WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *IngredientRepository) GetByVariantID(ctx context.Context, variantID int64) ([]*model.VariantIngredient, error) {
	query := `
		SELECT 
			vi.id, vi.variant_id, vi.ingredient_id, vi.quantity, vi.created_at, vi.updated_at,
			i.id as "ingredient.id", i.public_id as "ingredient.public_id", 
			i.name as "ingredient.name", i.unit_price as "ingredient.unit_price", 
			i.unit as "ingredient.unit", i.created_at as "ingredient.created_at", 
			i.updated_at as "ingredient.updated_at"
		FROM variant_ingredients vi
		JOIN ingredients i ON vi.ingredient_id = i.id
		WHERE vi.variant_id = $1
		ORDER BY i.name
	`
	var variantIngredients []*model.VariantIngredient
	err := r.db.SelectContext(ctx, &variantIngredients, query, variantID)
	if err != nil {
		return nil, err
	}
	return variantIngredients, nil
}

func (r *IngredientRepository) AddToVariant(ctx context.Context, variantID int64, ingredientID int64, quantity float64) error {
	query := `
		INSERT INTO variant_ingredients (variant_id, ingredient_id, quantity, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (variant_id, ingredient_id) 
		DO UPDATE SET quantity = $3, updated_at = $5
	`
	_, err := r.db.ExecContext(ctx, query,
		variantID,
		ingredientID,
		quantity,
		time.Now(),
		time.Now(),
	)
	return err
}

func (r *IngredientRepository) RemoveFromVariant(ctx context.Context, variantID int64, ingredientID int64) error {
	query := `DELETE FROM variant_ingredients WHERE variant_id = $1 AND ingredient_id = $2`
	_, err := r.db.ExecContext(ctx, query, variantID, ingredientID)
	return err
}

func (r *IngredientRepository) CalculateVariantCost(ctx context.Context, variantID int64) (float64, error) {
	query := `
		SELECT COALESCE(SUM(vi.quantity * i.unit_price), 0) as total_cost
		FROM variant_ingredients vi
		JOIN ingredients i ON vi.ingredient_id = i.id
		WHERE vi.variant_id = $1
	`
	var totalCost float64
	err := r.db.GetContext(ctx, &totalCost, query, variantID)
	if err != nil {
		return 0, err
	}
	return totalCost, nil
}

 