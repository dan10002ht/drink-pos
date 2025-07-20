package service

import "food-pos-backend/internal/repository"

type ExampleService struct {
	repo *repository.ExampleRepository
}

func NewExampleService() *ExampleService {
	return &ExampleService{
		repo: repository.NewExampleRepository(),
	}
}

func (s *ExampleService) GetExample() string {
	return s.repo.GetExample()
} 