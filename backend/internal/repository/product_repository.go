package repository

import (
	"context"
	"database/sql"
	"errors"
	"food-pos-backend/internal/model"
	"math"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type ProductRepository struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) *ProductRepository {
	return &ProductRepository{
		db: db,
	}
}

func (r *ProductRepository) CreateProduct(ctx context.Context, req *model.CreateProductRequest) (*model.Product, error) {
	// Start transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Create product
	var product model.Product
	query := `
		INSERT INTO products (name, description, private_note)
		VALUES ($1, $2, $3)
		RETURNING id, public_id, name, description, private_note, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, query, req.Name, req.Description, req.PrivateNote).Scan(
		&product.ID,
		&product.PublicID,
		&product.Name,
		&product.Description,
		&product.PrivateNote,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Create variants
	variants := make([]model.Variant, 0, len(req.Variants))
	for _, variantReq := range req.Variants {
		var variant model.Variant
		variantQuery := `
			INSERT INTO variants (product_id, name, description, private_note, price)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		`
		err = tx.QueryRowContext(ctx, variantQuery, product.ID, variantReq.Name, variantReq.Description, variantReq.PrivateNote, variantReq.Price).Scan(
			&variant.ID,
			&variant.PublicID,
			&variant.ProductID,
			&variant.Name,
			&variant.Description,
			&variant.PrivateNote,
			&variant.Price,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, variant)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	product.Variants = variants
	return &product, nil
}

func (r *ProductRepository) UpdateProductByPublicID(ctx context.Context, publicID string, req *model.UpdateProductRequest) (*model.Product, error) {
	// Start transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Get product ID from public ID
	var productID int64
	err = tx.QueryRowContext(ctx, "SELECT id FROM products WHERE public_id = $1", publicID).Scan(&productID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Update product
	now := time.Now()
	productQuery := `
		UPDATE products 
		SET name = $1, description = $2, private_note = $3, updated_at = $4
		WHERE id = $5
		RETURNING id, public_id, name, description, private_note, created_at, updated_at
	`
	var product model.Product
	err = tx.QueryRowContext(ctx, productQuery, req.Name, req.Description, req.PrivateNote, now, productID).Scan(
		&product.ID,
		&product.PublicID,
		&product.Name,
		&product.Description,
		&product.PrivateNote,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Delete existing variant ingredients first (due to foreign key constraint)
	_, err = tx.ExecContext(ctx, `
		DELETE FROM variant_ingredients 
		WHERE variant_id IN (SELECT id FROM variants WHERE product_id = $1)
	`, productID)
	if err != nil {
		return nil, err
	}

	// Delete existing variants
	_, err = tx.ExecContext(ctx, "DELETE FROM variants WHERE product_id = $1", productID)
	if err != nil {
		return nil, err
	}

	// Create new variants
	variants := make([]model.Variant, 0, len(req.Variants))
	for _, variantReq := range req.Variants {
		var variant model.Variant
		variantQuery := `
			INSERT INTO variants (product_id, name, description, private_note, price)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		`
		err = tx.QueryRowContext(ctx, variantQuery, productID, variantReq.Name, variantReq.Description, variantReq.PrivateNote, variantReq.Price).Scan(
			&variant.ID,
			&variant.PublicID,
			&variant.ProductID,
			&variant.Name,
			&variant.Description,
			&variant.PrivateNote,
			&variant.Price,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, variant)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	product.Variants = variants
	return &product, nil
}

func (r *ProductRepository) UpdateProduct(ctx context.Context, productID int64, req *model.UpdateProductRequest) (*model.Product, error) {
	// Start transaction
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Update product
	now := time.Now()
	productQuery := `
		UPDATE products 
		SET name = $1, description = $2, private_note = $3, updated_at = $4
		WHERE id = $5
		RETURNING id, public_id, name, description, private_note, created_at, updated_at
	`
	var product model.Product
	err = tx.QueryRowContext(ctx, productQuery, req.Name, req.Description, req.PrivateNote, now, productID).Scan(
		&product.ID,
		&product.PublicID,
		&product.Name,
		&product.Description,
		&product.PrivateNote,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Delete existing variant ingredients first (due to foreign key constraint)
	_, err = tx.ExecContext(ctx, `
		DELETE FROM variant_ingredients 
		WHERE variant_id IN (SELECT id FROM variants WHERE product_id = $1)
	`, productID)
	if err != nil {
		return nil, err
	}

	// Delete existing variants
	_, err = tx.ExecContext(ctx, "DELETE FROM variants WHERE product_id = $1", productID)
	if err != nil {
		return nil, err
	}

	// Create new variants
	variants := make([]model.Variant, 0, len(req.Variants))
	for _, variantReq := range req.Variants {
		var variant model.Variant
		variantQuery := `
			INSERT INTO variants (product_id, name, description, private_note, price)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, public_id, product_id, name, description, private_note, price, created_at, updated_at
		`
		err = tx.QueryRowContext(ctx, variantQuery, productID, variantReq.Name, variantReq.Description, variantReq.PrivateNote, variantReq.Price).Scan(
			&variant.ID,
			&variant.PublicID,
			&variant.ProductID,
			&variant.Name,
			&variant.Description,
			&variant.PrivateNote,
			&variant.Price,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, variant)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	product.Variants = variants
	return &product, nil
}

func (r *ProductRepository) ListProducts(ctx context.Context) ([]*model.Product, error) {
	// Get all products with variants using LEFT JOIN
	query := `
		SELECT 
			p.id, p.public_id, p.name, p.description, p.private_note, p.created_at, p.updated_at,
			v.id, v.public_id, v.product_id, v.name, v.description, v.private_note, v.price, v.created_at, v.updated_at
		FROM products p
		LEFT JOIN variants v ON p.id = v.product_id
		ORDER BY p.created_at DESC, v.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Map to group variants by product
	productMap := make(map[int64]*model.Product)

	for rows.Next() {
		var product model.Product
		var variant model.Variant
		var variantID sql.NullInt64
		var variantPublicID sql.NullString
		var variantProductID sql.NullInt64
		var variantName, variantDescription, variantPrivateNote sql.NullString
		var variantPrice sql.NullFloat64
		var variantCreatedAt, variantUpdatedAt sql.NullTime

		err := rows.Scan(
			&product.ID,
			&product.PublicID,
			&product.Name,
			&product.Description,
			&product.PrivateNote,
			&product.CreatedAt,
			&product.UpdatedAt,
			&variantID,
			&variantPublicID,
			&variantProductID,
			&variantName,
			&variantDescription,
			&variantPrivateNote,
			&variantPrice,
			&variantCreatedAt,
			&variantUpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Check if product already exists in map
		if existingProduct, exists := productMap[product.ID]; exists {
			// Product exists, just add variant if it exists
			if variantID.Valid {
				variant.ID = variantID.Int64
				variant.PublicID = variantPublicID.String
				variant.ProductID = variantProductID.Int64
				variant.Name = variantName.String
				variant.Description = variantDescription.String
				variant.PrivateNote = variantPrivateNote.String
				variant.Price = variantPrice.Float64
				variant.CreatedAt = variantCreatedAt.Time
				variant.UpdatedAt = variantUpdatedAt.Time
				existingProduct.Variants = append(existingProduct.Variants, variant)
			}
		} else {
			// New product, add to map
			product.Variants = []model.Variant{}
			if variantID.Valid {
				variant.ID = variantID.Int64
				variant.PublicID = variantPublicID.String
				variant.ProductID = variantProductID.Int64
				variant.Name = variantName.String
				variant.Description = variantDescription.String
				variant.PrivateNote = variantPrivateNote.String
				variant.Price = variantPrice.Float64
				variant.CreatedAt = variantCreatedAt.Time
				variant.UpdatedAt = variantUpdatedAt.Time
				product.Variants = append(product.Variants, variant)
			}
			productMap[product.ID] = &product
		}
	}

	// Convert map to slice
	products := make([]*model.Product, 0, len(productMap))
	for _, product := range productMap {
		products = append(products, product)
	}

	return products, nil
}

func (r *ProductRepository) ListProductsWithPagination(ctx context.Context, filter *model.ProductFilter) (*model.PaginatedProducts, error) {
	// Build WHERE clause for search
	whereClause := ""
	args := []interface{}{}
	argIndex := 1

	if filter.Search != "" {
		whereClause = "WHERE p.name ILIKE $1 OR p.description ILIKE $1"
		args = append(args, "%"+filter.Search+"%")
		argIndex = 2
	}

	// Build ORDER BY clause
	orderBy := "ORDER BY p.created_at DESC"
	if filter.SortBy != "" {
		validSortFields := map[string]string{
			"name":        "LOWER(p.name)",
			"created_at":  "p.created_at",
			"updated_at":  "p.updated_at",
		}
		if sortField, exists := validSortFields[filter.SortBy]; exists {
			orderBy = "ORDER BY " + sortField + " " + filter.SortOrder
		}
	}

	// Count total records
	countQuery := `
		SELECT COUNT(*)
		FROM products p
		` + whereClause

	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	offset := (filter.Page - 1) * filter.Limit
	totalPages := int(math.Ceil(float64(total) / float64(filter.Limit)))

	// Get products with pagination
	query := `
		SELECT 
			p.id, p.public_id, p.name, p.description, p.private_note, p.created_at, p.updated_at,
			v.id, v.public_id, v.product_id, v.name, v.description, v.private_note, v.price, v.created_at, v.updated_at
		FROM products p
		LEFT JOIN variants v ON p.id = v.product_id
		` + whereClause + `
		` + orderBy + `
		LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)

	args = append(args, filter.Limit, offset)



	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Map to group variants by product
	productMap := make(map[int64]*model.Product)

	for rows.Next() {
		var product model.Product
		var variant model.Variant
		var variantID sql.NullInt64
		var variantPublicID sql.NullString
		var variantProductID sql.NullInt64
		var variantName, variantDescription, variantPrivateNote sql.NullString
		var variantPrice sql.NullFloat64
		var variantCreatedAt, variantUpdatedAt sql.NullTime

		err := rows.Scan(
			&product.ID,
			&product.PublicID,
			&product.Name,
			&product.Description,
			&product.PrivateNote,
			&product.CreatedAt,
			&product.UpdatedAt,
			&variantID,
			&variantPublicID,
			&variantProductID,
			&variantName,
			&variantDescription,
			&variantPrivateNote,
			&variantPrice,
			&variantCreatedAt,
			&variantUpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Check if product already exists in map
		if existingProduct, exists := productMap[product.ID]; exists {
			// Product exists, just add variant if it exists
			if variantID.Valid {
				variant.ID = variantID.Int64
				variant.PublicID = variantPublicID.String
				variant.ProductID = variantProductID.Int64
				variant.Name = variantName.String
				variant.Description = variantDescription.String
				variant.PrivateNote = variantPrivateNote.String
				variant.Price = variantPrice.Float64
				variant.CreatedAt = variantCreatedAt.Time
				variant.UpdatedAt = variantUpdatedAt.Time
				existingProduct.Variants = append(existingProduct.Variants, variant)
			}
		} else {
			// New product, add to map
			product.Variants = []model.Variant{}
			if variantID.Valid {
				variant.ID = variantID.Int64
				variant.PublicID = variantPublicID.String
				variant.ProductID = variantProductID.Int64
				variant.Name = variantName.String
				variant.Description = variantDescription.String
				variant.PrivateNote = variantPrivateNote.String
				variant.Price = variantPrice.Float64
				variant.CreatedAt = variantCreatedAt.Time
				variant.UpdatedAt = variantUpdatedAt.Time
				product.Variants = append(product.Variants, variant)
			}
			productMap[product.ID] = &product
		}
	}

	// Convert map to slice and preserve order
	products := make([]*model.Product, 0, len(productMap))
	
	// Get products in the correct order by doing a separate query
	productOrderQuery := `
		SELECT p.id
		FROM products p
		` + whereClause + `
		` + orderBy + `
		LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)

	orderRows, err := r.db.QueryContext(ctx, productOrderQuery, args...)
	if err != nil {
		return nil, err
	}
	defer orderRows.Close()

	// Build ordered product list
	for orderRows.Next() {
		var productID int64
		err := orderRows.Scan(&productID)
		if err != nil {
			return nil, err
		}
		if product, exists := productMap[productID]; exists {
			products = append(products, product)
		}
	}

	return &model.PaginatedProducts{
		Products:   products,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
		HasNext:    filter.Page < totalPages,
		HasPrev:    filter.Page > 1,
	}, nil
}

func (r *ProductRepository) GetProductByPublicID(ctx context.Context, publicID string) (*model.Product, error) {
	// Get product
	var product model.Product
	productQuery := `
		SELECT id, public_id, name, description, private_note, created_at, updated_at
		FROM products
		WHERE public_id = $1
	`
	err := r.db.QueryRowContext(ctx, productQuery, publicID).Scan(
		&product.ID,
		&product.PublicID,
		&product.Name,
		&product.Description,
		&product.PrivateNote,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Get variants with ingredients
	variantsQuery := `
		SELECT v.id, v.public_id, v.product_id, v.name, v.description, v.private_note, v.price, v.created_at, v.updated_at
		FROM variants v
		WHERE v.product_id = $1
		ORDER BY v.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, variantsQuery, product.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []model.Variant
	for rows.Next() {
		var variant model.Variant
		err := rows.Scan(
			&variant.ID,
			&variant.PublicID,
			&variant.ProductID,
			&variant.Name,
			&variant.Description,
			&variant.PrivateNote,
			&variant.Price,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get ingredients for this variant
		ingredientsQuery := `
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
		ingredientRows, err := r.db.QueryContext(ctx, ingredientsQuery, variant.ID)
		if err != nil {
			return nil, err
		}
		defer ingredientRows.Close()

		var ingredients []model.VariantIngredient
		for ingredientRows.Next() {
			var vi model.VariantIngredient
			err := ingredientRows.Scan(
				&vi.ID,
				&vi.VariantID,
				&vi.IngredientID,
				&vi.Quantity,
				&vi.CreatedAt,
				&vi.UpdatedAt,
				&vi.Ingredient.ID,
				&vi.Ingredient.PublicID,
				&vi.Ingredient.Name,
				&vi.Ingredient.UnitPrice,
				&vi.Ingredient.Unit,
				&vi.Ingredient.CreatedAt,
				&vi.Ingredient.UpdatedAt,
			)
			if err != nil {
				return nil, err
			}
			ingredients = append(ingredients, vi)
		}
		variant.Ingredients = ingredients
		variants = append(variants, variant)
	}

	product.Variants = variants
	return &product, nil
}

func (r *ProductRepository) GetProductByID(ctx context.Context, id int64) (*model.Product, error) {
	// Get product
	var product model.Product
	productQuery := `
		SELECT id, public_id, name, description, private_note, created_at, updated_at
		FROM products
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, productQuery, id).Scan(
		&product.ID,
		&product.PublicID,
		&product.Name,
		&product.Description,
		&product.PrivateNote,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Get variants with ingredients
	variantsQuery := `
		SELECT v.id, v.public_id, v.product_id, v.name, v.description, v.private_note, v.price, v.created_at, v.updated_at
		FROM variants v
		WHERE v.product_id = $1
		ORDER BY v.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, variantsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []model.Variant
	for rows.Next() {
		var variant model.Variant
		err := rows.Scan(
			&variant.ID,
			&variant.PublicID,
			&variant.ProductID,
			&variant.Name,
			&variant.Description,
			&variant.PrivateNote,
			&variant.Price,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get ingredients for this variant
		ingredientsQuery := `
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
		ingredientRows, err := r.db.QueryContext(ctx, ingredientsQuery, variant.ID)
		if err != nil {
			return nil, err
		}
		defer ingredientRows.Close()

		var ingredients []model.VariantIngredient
		for ingredientRows.Next() {
			var vi model.VariantIngredient
			err := ingredientRows.Scan(
				&vi.ID,
				&vi.VariantID,
				&vi.IngredientID,
				&vi.Quantity,
				&vi.CreatedAt,
				&vi.UpdatedAt,
				&vi.Ingredient.ID,
				&vi.Ingredient.PublicID,
				&vi.Ingredient.Name,
				&vi.Ingredient.UnitPrice,
				&vi.Ingredient.Unit,
				&vi.Ingredient.CreatedAt,
				&vi.Ingredient.UpdatedAt,
			)
			if err != nil {
				return nil, err
			}
			ingredients = append(ingredients, vi)
		}
		variant.Ingredients = ingredients
		variants = append(variants, variant)
	}

	product.Variants = variants
	return &product, nil
} 