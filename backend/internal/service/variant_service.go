package service

import (
	"context"
	"strconv"
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
	// Convert productID from string to int64
	productIDInt, err := strconv.ParseInt(productID, 10, 64)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	variant := &model.Variant{
		ProductID: productIDInt,
		Name:      name,
		Price:     price,
		CreatedAt: now,
		UpdatedAt: now,
	}
	
	err = s.repo.CreateVariant(ctx, variant)
	if err != nil {
		return nil, err
	}
	
	return variant, nil
}

func (s *VariantService) ListVariantsByProduct(ctx context.Context, productID string) ([]*model.Variant, error) {
	// Convert productID from string to int64
	productIDInt, err := strconv.ParseInt(productID, 10, 64)
	if err != nil {
		return nil, err
	}
	
	return s.repo.ListVariantsByProduct(ctx, productIDInt)
} 