package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable"
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// Sample ingredients
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
		// Check if ingredient already exists
		var count int
		err = db.QueryRow(`SELECT COUNT(*) FROM ingredients WHERE name = $1`, ingredient.name).Scan(&count)
		if err != nil {
			log.Printf("Failed to query ingredient %s: %v", ingredient.name, err)
			continue
		}
		if count > 0 {
			fmt.Printf("Ingredient %s already exists. Skipping.\n", ingredient.name)
			continue
		}

		// Insert ingredient
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