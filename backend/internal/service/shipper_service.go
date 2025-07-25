package service

import (
	"context"
	"time"

	"food-pos-backend/internal/model"
	"food-pos-backend/internal/repository"

	"github.com/google/uuid"
)

type ShipperService struct {
	shipperRepo *repository.ShipperRepository
}

func NewShipperService(shipperRepo *repository.ShipperRepository) *ShipperService {
	return &ShipperService{
		shipperRepo: shipperRepo,
	}
}

// CreateShipper creates a new shipper
func (s *ShipperService) CreateShipper(ctx context.Context, req *model.CreateShipperRequest, createdBy int64) (*model.Shipper, error) {
	shipper := &model.Shipper{
		PublicID:  uuid.New(),
		Name:      req.Name,
		Phone:     req.Phone,
		Email:     req.Email,
		IsActive:  true,
		CreatedBy: &createdBy,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := s.shipperRepo.CreateShipper(ctx, shipper)
	if err != nil {
		return nil, err
	}

	return shipper, nil
}

// GetShipper gets shipper by public ID
func (s *ShipperService) GetShipper(ctx context.Context, publicID string) (*model.Shipper, error) {
	uuid, err := uuid.Parse(publicID)
	if err != nil {
		return nil, err
	}
	return s.shipperRepo.GetShipperByPublicID(ctx, uuid)
}

// ListShippers lists shippers with pagination and filters
func (s *ShipperService) ListShippers(ctx context.Context, filters map[string]interface{}, page, limit int) (*model.ShippersResponse, error) {
	shippers, total, err := s.shipperRepo.ListShippers(ctx, filters, page, limit)
	if err != nil {
		return nil, err
	}

	pages := (total + limit - 1) / limit

	return &model.ShippersResponse{
		Shippers: shippers,
		Total:    total,
		Page:     page,
		Limit:    limit,
		Pages:    pages,
	}, nil
}

// UpdateShipper updates shipper
func (s *ShipperService) UpdateShipper(ctx context.Context, publicID string, req *model.UpdateShipperRequest, updatedBy int64) (*model.Shipper, error) {
	uuid, err := uuid.Parse(publicID)
	if err != nil {
		return nil, err
	}
	
	shipper, err := s.shipperRepo.GetShipperByPublicID(ctx, uuid)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		shipper.Name = *req.Name
	}
	if req.Phone != nil {
		shipper.Phone = *req.Phone
	}
	if req.Email != nil {
		shipper.Email = req.Email
	}
	if req.IsActive != nil {
		shipper.IsActive = *req.IsActive
	}

	shipper.UpdatedAt = time.Now()

	err = s.shipperRepo.UpdateShipper(ctx, shipper)
	if err != nil {
		return nil, err
	}

	return shipper, nil
}

// DeleteShipper deletes shipper
func (s *ShipperService) DeleteShipper(ctx context.Context, publicID string) error {
	uuid, err := uuid.Parse(publicID)
	if err != nil {
		return err
	}
	
	shipper, err := s.shipperRepo.GetShipperByPublicID(ctx, uuid)
	if err != nil {
		return err
	}

	return s.shipperRepo.DeleteShipper(ctx, shipper.ID)
}

// GetActiveShippers gets all active shippers
func (s *ShipperService) GetActiveShippers(ctx context.Context) ([]model.Shipper, error) {
	return s.shipperRepo.GetActiveShippers(ctx)
} 