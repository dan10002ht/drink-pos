package service

import (
	"errors"
	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type AdminService struct {
	userRepo   *repository.UserRepository
	jwtService *jwt.JWTService
}

func NewAdminService(jwtService *jwt.JWTService) *AdminService {
	return &AdminService{
		userRepo:   repository.NewUserRepository(),
		jwtService: jwtService,
	}
}

func (s *AdminService) Login(username, password string) (string, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return "", errors.New("invalid username or password")
	}
	if !user.IsActive || user.Role != "super_admin" {
		return "", errors.New("unauthorized")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("invalid username or password")
	}
	
	// Generate JWT token
	token, err := s.jwtService.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return "", errors.New("failed to generate token")
	}
	
	return token, nil
} 