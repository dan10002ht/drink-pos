package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/food_pos?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// Check if super_admin exists
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = 'super_admin'`).Scan(&count)
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}
	if count > 0 {
		fmt.Println("super_admin already exists. Nothing to do.")
		return
	}

	// Hash password
	password := "admin"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Insert super_admin
	_, err = db.Exec(`
		INSERT INTO users (public_id, username, email, password_hash, full_name, role, is_active, created_at, updated_at)
		VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8)
	`,
		"super_admin",
		"superadmin@foodpos.com",
		string(hash),
		"Super Admin",
		"super_admin",
		true,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		log.Fatalf("Failed to insert super_admin: %v", err)
	}
	fmt.Println("super_admin created successfully!")
} 