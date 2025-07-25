package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

type Migration struct {
	Version string
	Up      string
}

func main() {
	db, err := sql.Open("postgres", "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	createMigrationsTable(db)
	migrations := loadMigrations()
	runMigrationsUp(db, migrations)
}

func createMigrationsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create migrations table:", err)
	}
}

func loadMigrations() []Migration {
	var migrations []Migration
	files, err := filepath.Glob("../../migrations/*.sql")
	if err != nil {
		log.Fatal("Failed to read migrations directory:", err)
	}
	migrationFiles := make(map[string]map[string]string)
	for _, file := range files {
		baseName := filepath.Base(file)
		parts := strings.Split(baseName, ".")
		if len(parts) >= 3 {
			version := parts[0]
			fileType := parts[len(parts)-2]
			if migrationFiles[version] == nil {
				migrationFiles[version] = make(map[string]string)
			}
			content, err := os.ReadFile(file)
			if err != nil {
				log.Printf("Failed to read file %s: %v", file, err)
				continue
			}
			migrationFiles[version][fileType] = string(content)
		}
	}
	for version, files := range migrationFiles {
		migration := Migration{Version: version}
		if up, exists := files["up"]; exists {
			migration.Up = up
		}
		migrations = append(migrations, migration)
	}
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})
	return migrations
}

func runMigrationsUp(db *sql.DB, migrations []Migration) {
	fmt.Println("Running migrations up...")
	for _, migration := range migrations {
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM migrations WHERE version = $1", migration.Version).Scan(&count)
		if err != nil {
			log.Printf("Failed to check migration %s: %v", migration.Version, err)
			continue
		}
		if count > 0 {
			fmt.Printf("Migration %s already applied, skipping\n", migration.Version)
			continue
		}
		if migration.Up == "" {
			fmt.Printf("No up migration for %s, skipping\n", migration.Version)
			continue
		}
		fmt.Printf("Applying migration %s...\n", migration.Version)
		_, err = db.Exec(migration.Up)
		if err != nil {
			log.Printf("Failed to apply migration %s: %v", migration.Version, err)
			continue
		}
		_, err = db.Exec("INSERT INTO migrations (version) VALUES ($1)", migration.Version)
		if err != nil {
			log.Printf("Failed to record migration %s: %v", migration.Version, err)
			continue
		}
		fmt.Printf("Migration %s applied successfully\n", migration.Version)
	}
	fmt.Println("Migrations up completed")
} 