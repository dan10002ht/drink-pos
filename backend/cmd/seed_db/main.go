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
		dbURL = "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// Seed super_admin
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = 'super_admin'`).Scan(&count)
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}
	if count == 0 {
		password := "admin"
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}
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
	} else {
		fmt.Println("super_admin already exists. Nothing to do.")
	}

	// Seed ingredients
	ingredients := []struct {
		name      string
		unitPrice float64
		unit      string
	}{
		{"Bột mì", 15000, "kg"},
		{"Đường", 20000, "kg"},
		{"Trứng", 5000, "quả"},
		{"Sữa", 30000, "lít"},
		{"Bơ", 80000, "kg"},
		{"Muối", 5000, "kg"},
		{"Nước", 1000, "lít"},
		{"Dầu ăn", 25000, "lít"},
		{"Men nở", 50000, "g"},
		{"Vanilla", 100000, "ml"},
	}
	for _, ingredient := range ingredients {
		err = db.QueryRow(`SELECT COUNT(*) FROM ingredients WHERE name = $1`, ingredient.name).Scan(&count)
		if err != nil {
			log.Printf("Failed to query ingredient %s: %v", ingredient.name, err)
			continue
		}
		if count > 0 {
			fmt.Printf("Ingredient %s already exists. Skipping.\n", ingredient.name)
			continue
		}
		_, err = db.Exec(`
			INSERT INTO ingredients (public_id, name, unit_price, unit, created_at, updated_at)
			VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
		`,
			ingredient.name,
			ingredient.unitPrice,
			ingredient.unit,
			time.Now(),
			time.Now(),
		)
		if err != nil {
			log.Printf("Failed to insert ingredient %s: %v", ingredient.name, err)
			continue
		}
		fmt.Printf("Ingredient %s created successfully!\n", ingredient.name)
	}
} 