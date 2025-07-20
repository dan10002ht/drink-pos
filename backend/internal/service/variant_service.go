package service

import (
	"context"
	"time"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"
)

type VariantService struct {
	repo *repository.VariantRepository
}

func NewVariantService(repo *repository.VariantRepository) *VariantService {
	return &VariantService{
		repo: repo,
	}
}

func (s *VariantService) CreateVariant(ctx context.Context, productID, name string, price float64) (*model.Variant, error) {
	now := time.Now()
	variant := &model.Variant{
		ProductID: productID,
		Name:      name,
		Price:     price,
		CreatedAt: now,
		UpdatedAt: now,
	}
	
	err := s.repo.CreateVariant(ctx, variant)
	if err != nil {
		return nil, err
	}
	
	return variant, nil
}

func (s *VariantService) ListVariantsByProduct(ctx context.Context, productID string) ([]*model.Variant, error) {
	return s.repo.ListVariantsByProduct(ctx, productID)
} 