package service

import (
	"context"
	"time"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
)

type IngredientService struct {
	ingredientRepo *repository.IngredientRepository
	variantRepo    *repository.VariantRepository
}

func NewIngredientService(ingredientRepo *repository.IngredientRepository, variantRepo *repository.VariantRepository) *IngredientService {
	return &IngredientService{
		ingredientRepo: ingredientRepo,
		variantRepo:    variantRepo,
	}
}

func (s *IngredientService) CreateIngredient(ctx context.Context, req *model.CreateIngredientRequest) (*model.Ingredient, error) {
	now := time.Now()
	ingredient := &model.Ingredient{
		Name:      req.Name,
		UnitPrice: req.UnitPrice,
		Unit:      req.Unit,
		CreatedAt: now,
		UpdatedAt: now,
	}

	err := s.ingredientRepo.Create(ctx, ingredient)
	if err != nil {
		return nil, err
	}

	return ingredient, nil
}

func (s *IngredientService) GetIngredient(ctx context.Context, publicID string) (*model.Ingredient, error) {
	return s.ingredientRepo.GetByPublicID(ctx, publicID)
}

func (s *IngredientService) GetAllIngredients(ctx context.Context) ([]*model.Ingredient, error) {
	return s.ingredientRepo.GetAll(ctx)
}

func (s *IngredientService) UpdateIngredient(ctx context.Context, publicID string, req *model.UpdateIngredientRequest) (*model.Ingredient, error) {
	ingredient, err := s.ingredientRepo.GetByPublicID(ctx, publicID)
	if err != nil {
		return nil, err
	}
	if ingredient == nil {
		return nil, ErrNotFound
	}

	ingredient.Name = req.Name
	ingredient.UnitPrice = req.UnitPrice
	ingredient.Unit = req.Unit
	ingredient.UpdatedAt = time.Now()

	err = s.ingredientRepo.Update(ctx, ingredient)
	if err != nil {
		return nil, err
	}

	return ingredient, nil
}

func (s *IngredientService) DeleteIngredient(ctx context.Context, publicID string) error {
	ingredient, err := s.ingredientRepo.GetByPublicID(ctx, publicID)
	if err != nil {
		return err
	}
	if ingredient == nil {
		return ErrNotFound
	}
	return s.ingredientRepo.Delete(ctx, ingredient.ID)
}

func (s *IngredientService) GetVariantIngredients(ctx context.Context, variantPublicID string) ([]*model.VariantIngredient, error) {
	variant, err := s.variantRepo.GetByPublicID(ctx, variantPublicID)
	if err != nil {
		return nil, err
	}
	if variant == nil {
		return nil, ErrNotFound
	}
	return s.ingredientRepo.GetByVariantID(ctx, variant.ID)
}

func (s *IngredientService) AddIngredientToVariant(ctx context.Context, variantPublicID string, req *model.CreateVariantIngredientRequest) error {
	variant, err := s.variantRepo.GetByPublicID(ctx, variantPublicID)
	if err != nil {
		return err
	}
	if variant == nil {
		return ErrNotFound
	}
	ingredient, err := s.ingredientRepo.GetByPublicID(ctx, req.IngredientID)
	if err != nil {
		return err
	}
	if ingredient == nil {
		return ErrNotFound
	}
	return s.ingredientRepo.AddToVariant(ctx, variant.ID, ingredient.ID, req.Quantity)
}

func (s *IngredientService) RemoveIngredientFromVariant(ctx context.Context, variantPublicID string, ingredientPublicID string) error {
	variant, err := s.variantRepo.GetByPublicID(ctx, variantPublicID)
	if err != nil {
		return err
	}
	if variant == nil {
		return ErrNotFound
	}
	ingredient, err := s.ingredientRepo.GetByPublicID(ctx, ingredientPublicID)
	if err != nil {
		return err
	}
	if ingredient == nil {
		return ErrNotFound
	}
	return s.ingredientRepo.RemoveFromVariant(ctx, variant.ID, ingredient.ID)
}

func (s *IngredientService) CalculateVariantCost(ctx context.Context, variantPublicID string) (float64, error) {
	variant, err := s.variantRepo.GetByPublicID(ctx, variantPublicID)
	if err != nil {
		return 0, err
	}
	if variant == nil {
		return 0, ErrNotFound
	}
	return s.ingredientRepo.CalculateVariantCost(ctx, variant.ID)
} 