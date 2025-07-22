package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := "postgres://postgres:password@localhost:5433/postgres?sslmode=disable"
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// Terminate all connections to food_pos
	_, err = db.Exec(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'food_pos' AND pid <> pg_backend_pid();`)
	if err != nil {
		log.Printf("Warning: Failed to terminate connections: %v", err)
	}

	_, err = db.Exec("DROP DATABASE IF EXISTS food_pos;")
	if err != nil {
		log.Fatalf("Failed to drop database: %v", err)
	}
	_, err = db.Exec("CREATE DATABASE food_pos;")
	if err != nil {
		log.Fatalf("Failed to create database: %v", err)
	}
	log.Println("Database food_pos dropped and created successfully!")
} 