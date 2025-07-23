package main

import (
	"log"

	"food-pos-backend/config"
	"food-pos-backend/internal/handler"
	"food-pos-backend/internal/jwt"
	"food-pos-backend/internal/middleware"
	"food-pos-backend/internal/repository"
	"food-pos-backend/internal/routes"
	"food-pos-backend/internal/service"
	"food-pos-backend/internal/ws"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database connection
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5433/food_pos?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(middleware.CORSMiddleware())
	r.Use(gin.Recovery())

	// Initialize JWT service
	jwtService := jwt.NewJWTService(cfg.JWT.SecretKey)

	// Initialize repositories
	ingredientRepo := repository.NewIngredientRepository(db)
	variantRepo := repository.NewVariantRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	shipperRepo := repository.NewShipperRepository(db)
	userRepo := repository.NewUserRepository()

	// Initialize WebSocket Hub (singleton)
	hub := ws.NewHub()
	go hub.Run()

	// Initialize services
	ingredientService := service.NewIngredientService(ingredientRepo, variantRepo)
	productService := service.NewProductService(productRepo, ingredientRepo)
	variantService := service.NewVariantService(variantRepo)
	orderService := service.NewOrderService(orderRepo, userRepo, hub)
	shipperService := service.NewShipperService(shipperRepo)

	// Initialize handlers
	adminHandler := handler.NewAdminHandler(jwtService)
	productHandler := handler.NewProductHandler(productService)
	variantHandler := handler.NewVariantHandler(variantService)
	ingredientHandler := handler.NewIngredientHandler(ingredientService)
	orderHandler := handler.NewOrderHandler(orderService, orderRepo, jwtService)
	shipperHandler := handler.NewShipperHandler(shipperService)
	wsHandler := handler.NewWebSocketHandler(hub)

	// Setup all routes
	routes.SetupRoutes(r, jwtService, adminHandler, productHandler, variantHandler, ingredientHandler, orderHandler, shipperHandler, wsHandler)

	log.Printf("Server started at :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
