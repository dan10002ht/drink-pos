package repository

import (
	"database/sql"
	"errors"
	"food-pos-backend/internal/model"

	_ "github.com/lib/pq"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository() *UserRepository {
	// Connect to database
	db, err := sql.Open("postgres", "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable")
	if err != nil {
		panic(err)
	}
	
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	query := `
		SELECT id, public_id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
		FROM users 
		WHERE username = $1 AND is_active = true
	`
	
	var user model.User
	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	
	return &user, nil
} 