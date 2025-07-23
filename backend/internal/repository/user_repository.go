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

// FindOrCreateUserByInfo tìm user theo phone hoặc email, nếu không có thì tạo user guest mới
func (r *UserRepository) FindOrCreateUserByInfo(fullName, phone, email string) (*model.User, error) {
	var user model.User
	query := `SELECT id, public_id, username, email, password_hash, full_name, role, is_active, created_at, updated_at, phone FROM users WHERE (email = $1 OR phone = $2) LIMIT 1`
	err := r.db.QueryRow(query, email, phone).Scan(
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
		&user.Phone,
	)
	if err == nil {
		// Nếu user chưa có phone mà lần này có phone, update bổ sung
		if user.Phone == "" && phone != "" {
			_, err := r.db.Exec("UPDATE users SET phone = $1 WHERE id = $2", phone, user.ID)
			if err == nil {
				user.Phone = phone
			}
		}
		// Nếu user chưa có email mà lần này có email, update bổ sung
		if user.Email == "" && email != "" {
			_, err := r.db.Exec("UPDATE users SET email = $1 WHERE id = $2", email, user.ID)
			if err == nil {
				user.Email = email
			}
		}
		return &user, nil // Đã tồn tại user
	}
	if err != sql.ErrNoRows {
		return nil, err // Lỗi khác
	}
	// Không tìm thấy, tạo user guest mới
	insertQuery := `INSERT INTO users (public_id, full_name, phone, email, role, is_guest, is_active) VALUES (gen_random_uuid(), $1, $2, $3, 'client', true, true) RETURNING id, public_id, username, email, password_hash, full_name, role, is_active, created_at, updated_at, phone`
	err = r.db.QueryRow(insertQuery, fullName, phone, email).Scan(
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
		&user.Phone,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
