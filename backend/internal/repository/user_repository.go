package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"food-pos-backend/internal/model"
	"strconv"

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
		SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
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
		&user.Phone,
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

func (r *UserRepository) GetByPublicID(publicID string) (*model.User, error) {
	query := `
		SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
		FROM users 
		WHERE public_id = $1 AND is_active = true
	`

	var user model.User
	err := r.db.QueryRow(query, publicID).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
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

func (r *UserRepository) GetByID(id int64) (*model.User, error) {
	query := `
		SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
		FROM users 
		WHERE id = $1 AND is_active = true
	`

	var user model.User
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
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
	query := `SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE (email = $1 OR phone = $2) LIMIT 1`
	err := r.db.QueryRow(query, email, phone).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == nil {
		// Nếu user chưa có phone mà lần này có phone, update bổ sung
		if !user.Phone.Valid && phone != "" {
			_, err := r.db.Exec("UPDATE users SET phone = $1 WHERE id = $2", phone, user.ID)
			if err == nil {
				user.Phone.String = phone
				user.Phone.Valid = true
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
	insertQuery := `INSERT INTO users (public_id, full_name, phone, email, role, is_guest, is_active) VALUES (gen_random_uuid(), $1, $2, $3, 'client', true, true) RETURNING id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at`
	err = r.db.QueryRow(insertQuery, fullName, phone, email).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail gets user by email
func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
		FROM users 
		WHERE email = $1
	`

	var user model.User
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.PublicID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
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

// Create creates a new user
func (r *UserRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (public_id, username, email, password_hash, full_name, phone, role, is_active, is_guest, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`

	err := r.db.QueryRow(
		query,
		user.PublicID,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.FullName,
		user.Phone,
		user.Role,
		user.IsActive,
		user.IsGuest,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)

	return err
}

// Update updates an existing user
func (r *UserRepository) Update(user *model.User) error {
	query := `
		UPDATE users 
		SET username = $1, email = $2, password_hash = $3, full_name = $4, phone = $5, role = $6, is_active = $7, updated_at = $8
		WHERE id = $9
	`

	_, err := r.db.Exec(
		query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.FullName,
		user.Phone,
		user.Role,
		user.IsActive,
		user.UpdatedAt,
		user.ID,
	)

	return err
}

// GetUsersWithFilters gets users with pagination and filters
func (r *UserRepository) GetUsersWithFilters(page, limit int, search, role, isActive, sortBy, sortOrder string) ([]model.User, int, error) {
	// Build WHERE clause
	whereClause := "WHERE 1=1"
	args := []any{}
	argIndex := 1

	if search != "" {
		whereClause += " AND (full_name ILIKE $" + strconv.Itoa(argIndex) + " OR email ILIKE $" + strconv.Itoa(argIndex) + " OR phone ILIKE $" + strconv.Itoa(argIndex) + ")"
		args = append(args, "%"+search+"%")
		argIndex++
	}

	if role != "" {
		whereClause += " AND role = $" + strconv.Itoa(argIndex)
		args = append(args, role)
		argIndex++
	}

	if isActive != "" {
		whereClause += " AND is_active = $" + strconv.Itoa(argIndex)
		args = append(args, isActive == "true")
		argIndex++
	}

	// Validate sortBy
	allowedSortFields := map[string]string{
		"created_at": "created_at",
		"name":       "full_name",
		"email":      "email",
		"role":       "role",
	}
	if sortField, ok := allowedSortFields[sortBy]; ok {
		sortBy = sortField
	} else {
		sortBy = "created_at"
	}

	// Validate sortOrder
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM users " + whereClause
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}


	// Get users with pagination
	offset := (page - 1) * limit
	query := `
		SELECT id, public_id, username, email, password_hash, full_name, phone, role, is_active, created_at, updated_at
		FROM users 
		` + whereClause + `
		ORDER BY ` + sortBy + ` ` + sortOrder + `
		LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		fmt.Println("Error getting users:", err)
		return nil, 0, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var user model.User
		err := rows.Scan(
			&user.ID,
			&user.PublicID,
			&user.Username,
			&user.Email,
			&user.PasswordHash,
			&user.FullName,
			&user.Phone,
			&user.Role,
			&user.IsActive,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			fmt.Println("Error scanning user row:", err)
			return nil, 0, err
		}
		users = append(users, user)
	}

	return users, total, nil
}

// GetUserStatistics gets user statistics
func (r *UserRepository) GetUserStatistics(userID int64) (*model.UserStatistics, error) {
	query := `
		SELECT 
			COUNT(*) as total_orders,
			COALESCE(SUM(total_amount), 0) as total_spent,
			MAX(created_at) as last_order_date
		FROM orders 
		WHERE created_by = $1
	`

	var stats model.UserStatistics
	err := r.db.QueryRow(query, userID).Scan(
		&stats.TotalOrders,
		&stats.TotalSpent,
		&stats.LastOrderDate,
	)

	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// GetUserRecentOrders gets recent orders for a user
func (r *UserRepository) GetUserRecentOrders(userID int64, limit int) ([]model.Order, error) {
	query := `
		SELECT id, public_id, order_number, status, total_amount, created_at
		FROM orders 
		WHERE created_by = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var order model.Order
		err := rows.Scan(
			&order.ID,
			&order.PublicID,
			&order.OrderNumber,
			&order.Status,
			&order.TotalAmount,
			&order.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}
