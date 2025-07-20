package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable"
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	fmt.Println("🔄 Starting database reset...")

	// Drop all tables in correct order (due to foreign key constraints)
	tables := []string{
		"variant_ingredients",
		"variants", 
		"ingredients",
		"products",
		"users",
	}

	for _, table := range tables {
		fmt.Printf("🗑️  Dropping table: %s\n", table)
		_, err := db.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", table))
		if err != nil {
			log.Printf("Warning: Failed to drop table %s: %v", table, err)
		}
	}

	// Drop extensions
	fmt.Println("🗑️  Dropping extensions...")
	db.Exec("DROP EXTENSION IF EXISTS \"uuid-ossp\" CASCADE")

	fmt.Println("✅ Database reset completed!")
	fmt.Println("📝 Now you can run migrations to recreate the schema:")
	fmt.Println("   psql postgres://postgres:password@localhost:5433/food_pos -f migrations/001_create_users_table.up.sql")
	fmt.Println("   psql postgres://postgres:password@localhost:5433/food_pos -f migrations/001_create_products_table.up.sql")
	fmt.Println("   psql postgres://postgres:password@localhost:5433/food_pos -f migrations/002_create_variants_table.up.sql")
	fmt.Println("   psql postgres://postgres:password@localhost:5433/food_pos -f migrations/003_create_ingredients_table.up.sql")
	fmt.Println("   psql postgres://postgres:password@localhost:5433/food_pos -f migrations/004_create_variant_ingredients_table.up.sql")
} 