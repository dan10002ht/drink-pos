package service

import (
	"context"
	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
)

type ProductService struct {
	productRepo    *repository.ProductRepository
	ingredientRepo *repository.IngredientRepository
}

func NewProductService(productRepo *repository.ProductRepository, ingredientRepo *repository.IngredientRepository) *ProductService {
	return &ProductService{
		productRepo:    productRepo,
		ingredientRepo: ingredientRepo,
	}
}

func (s *ProductService) CreateProduct(ctx context.Context, req *model.CreateProductRequest) (*model.Product, error) {
	// Validate request
	if req.Name == "" {
		return nil, &ValidationError{Message: "Product name is required"}
	}
	if len(req.Name) > 200 {
		return nil, &ValidationError{Message: "Product name cannot exceed 200 characters"}
	}
	if len(req.Variants) == 0 {
		return nil, &ValidationError{Message: "At least one variant is required"}
	}

	// Validate variants
	for i, variant := range req.Variants {
		if variant.Name == "" {
			return nil, &ValidationError{Message: "Variant name is required"}
		}
		if len(variant.Name) > 100 {
			return nil, &ValidationError{Message: "Variant name cannot exceed 100 characters"}
		}
		if variant.Price <= 0 {
			return nil, &ValidationError{Message: "Variant price must be positive"}
		}
		// Check for duplicate variant names
		for j := i + 1; j < len(req.Variants); j++ {
			if variant.Name == req.Variants[j].Name {
				return nil, &ValidationError{Message: "Duplicate variant names are not allowed"}
			}
		}
	}

	// Create product
	product, err := s.productRepo.CreateProduct(ctx, req)
	if err != nil {
		return nil, err
	}

	// Add ingredients to variants if provided
	for i, variant := range product.Variants {
		if len(req.Variants[i].Ingredients) > 0 {
			// Add ingredients to variant
			for _, ingredientReq := range req.Variants[i].Ingredients {
				// Get ingredient by public ID to get internal ID
				ingredient, err := s.ingredientRepo.GetByPublicID(ctx, ingredientReq.IngredientID)
				if err != nil {
					return nil, err
				}
				if ingredient == nil {
					return nil, &ValidationError{Message: "Ingredient not found: " + ingredientReq.IngredientID}
			}
			
				err = s.ingredientRepo.AddToVariant(ctx, variant.ID, ingredient.ID, ingredientReq.Quantity)
			if err != nil {
				return nil, err
			}
			}
		}
	}

	return product, nil
}

func (s *ProductService) UpdateProductByPublicID(ctx context.Context, publicID string, req *model.UpdateProductRequest) (*model.Product, error) {
	// Validate request
	if req.Name == "" {
		return nil, &ValidationError{Message: "Product name is required"}
	}
	if len(req.Name) > 200 {
		return nil, &ValidationError{Message: "Product name cannot exceed 200 characters"}
	}
	if len(req.Variants) == 0 {
		return nil, &ValidationError{Message: "At least one variant is required"}
	}

	// Validate variants
	for i, variant := range req.Variants {
		if variant.Name == "" {
			return nil, &ValidationError{Message: "Variant name is required"}
		}
		if len(variant.Name) > 100 {
			return nil, &ValidationError{Message: "Variant name cannot exceed 100 characters"}
		}
		if variant.Price <= 0 {
			return nil, &ValidationError{Message: "Variant price must be positive"}
		}
		// Check for duplicate variant names
		for j := i + 1; j < len(req.Variants); j++ {
			if variant.Name == req.Variants[j].Name {
				return nil, &ValidationError{Message: "Duplicate variant names are not allowed"}
			}
		}
	}

	// Update product
	product, err := s.productRepo.UpdateProductByPublicID(ctx, publicID, req)
	if err != nil {
		return nil, err
	}

	// Add ingredients to variants if provided
	for i, variant := range product.Variants {
		if len(req.Variants[i].Ingredients) > 0 {
			// Add ingredients to variant
			for _, ingredientReq := range req.Variants[i].Ingredients {
				// Get ingredient by public ID to get internal ID
				ingredient, err := s.ingredientRepo.GetByPublicID(ctx, ingredientReq.IngredientID)
				if err != nil {
					return nil, err
				}
				if ingredient == nil {
					return nil, &ValidationError{Message: "Ingredient not found: " + ingredientReq.IngredientID}
				}
				
				err = s.ingredientRepo.AddToVariant(ctx, variant.ID, ingredient.ID, ingredientReq.Quantity)
				if err != nil {
					return nil, err
				}
			}
		}
	}

	return product, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, productID string, req *model.UpdateProductRequest) (*model.Product, error) {
	// Validate request
	if req.Name == "" {
		return nil, &ValidationError{Message: "Product name is required"}
	}
	if len(req.Name) > 200 {
		return nil, &ValidationError{Message: "Product name cannot exceed 200 characters"}
	}
	if len(req.Variants) == 0 {
		return nil, &ValidationError{Message: "At least one variant is required"}
	}

	// Validate variants
	for i, variant := range req.Variants {
		if variant.Name == "" {
			return nil, &ValidationError{Message: "Variant name is required"}
		}
		if len(variant.Name) > 100 {
			return nil, &ValidationError{Message: "Variant name cannot exceed 100 characters"}
		}
		if variant.Price <= 0 {
			return nil, &ValidationError{Message: "Variant price must be positive"}
		}
		// Check for duplicate variant names
		for j := i + 1; j < len(req.Variants); j++ {
			if variant.Name == req.Variants[j].Name {
				return nil, &ValidationError{Message: "Duplicate variant names are not allowed"}
			}
		}
	}

	// Update product
	product, err := s.productRepo.UpdateProduct(ctx, productID, req)
	if err != nil {
		return nil, err
	}

	// Add ingredients to variants if provided
	for i, variant := range product.Variants {
		if len(req.Variants[i].Ingredients) > 0 {
			// Add ingredients to variant
			for _, ingredientReq := range req.Variants[i].Ingredients {
				// Get ingredient by public ID to get internal ID
				ingredient, err := s.ingredientRepo.GetByPublicID(ctx, ingredientReq.IngredientID)
				if err != nil {
					return nil, err
				}
				if ingredient == nil {
					return nil, &ValidationError{Message: "Ingredient not found: " + ingredientReq.IngredientID}
				}
				
				err = s.ingredientRepo.AddToVariant(ctx, variant.ID, ingredient.ID, ingredientReq.Quantity)
				if err != nil {
					return nil, err
				}
			}
		}
	}

	return product, nil
}

func (s *ProductService) ListProducts(ctx context.Context) ([]*model.Product, error) {
	return s.productRepo.ListProducts(ctx)
}

func (s *ProductService) ListProductsWithPagination(ctx context.Context, filter *model.ProductFilter) (*model.PaginatedProducts, error) {
	return s.productRepo.ListProductsWithPagination(ctx, filter)
}

func (s *ProductService) GetProductByPublicID(ctx context.Context, publicID string) (*model.Product, error) {
	return s.productRepo.GetProductByPublicID(ctx, publicID)
}

func (s *ProductService) GetProductByID(ctx context.Context, id string) (*model.Product, error) {
	return s.productRepo.GetProductByID(ctx, id)
}

// ValidationError represents a validation error
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
} 