#!/bin/bash

# 3 O'CLOCK Development Environment Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill process using a specific port
kill_port() {
    local port=$1
    local process_name=$2
    
    # Check if port is in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Port $port is in use. Killing existing $process_name process..."
        
        # Get PID of process using the port
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        
        if [ ! -z "$pid" ]; then
            # Kill the process
            kill -9 $pid 2>/dev/null || true
            print_success "Killed $process_name process (PID: $pid) on port $port"
        else
            print_warning "Could not find process using port $port"
        fi
    else
        print_status "Port $port is available for $process_name"
    fi
}

# Function to kill all development ports
kill_development_ports() {
    print_status "Checking and killing processes on development ports..."
    
    # Kill backend port (8080)
    kill_port 8080 "Backend"
    
    # Kill frontend port (5173)
    kill_port 5173 "Frontend"
    
    # Kill PostgreSQL port (5433)
    kill_port 5433 "PostgreSQL"
    
    # Kill Redis port (6379)
    kill_port 6379 "Redis"
    
    # Kill pgAdmin port (5050)
    kill_port 5050 "pgAdmin"
    
    print_success "Port cleanup completed"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to check if Node.js is available
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js and try again."
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    print_success "Node.js and npm are available"
}

# Function to create .env file if it doesn't exist
setup_env_file() {
    if [ ! -f "backend/.env" ]; then
        print_status "Creating .env file from env.example..."
        cp backend/env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_status "Backend .env file already exists"
    fi
}

# Function to stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    print_success "Stopped existing containers"
}

# Function to start Cloudflare Tunnel for a port
start_cloudflared_tunnel() {
    local port=$1
    local name=$2
    local log_file=$3
    print_status "Starting Cloudflare Tunnel for $name (port $port)..."
    cloudflared tunnel --url http://localhost:$port > $log_file 2>&1 &
    TUNNEL_PID=$!
    echo $TUNNEL_PID > .$name-tunnel.pid
    print_success "Cloudflare Tunnel for $name started (PID: $TUNNEL_PID)"
    # Chờ URL xuất hiện (tối đa 30s)
    local url=$(wait_for_tunnel_url $log_file 30)
    if [ ! -z "$url" ]; then
        print_success "$name Tunnel URL: $url"
    else
        print_warning "Could not detect $name tunnel URL after waiting. Check $log_file later."
    fi
}

# Wait for tunnel URL to appear in log (timeout 30s)
wait_for_tunnel_url() {
    local log_file=$1
    local timeout=${2:-30}
    local waited=0
    local url=""
    while [ $waited -lt $timeout ]; do
        url=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' "$log_file" | head -n1)
        if [ ! -z "$url" ]; then
            echo "$url"
            return 0
        fi
        sleep 1
        waited=$((waited+1))
    done
    return 1
}

# Function to update VITE_API_URL in frontend/.env
update_fe_env_api_url() {
    local be_url=$(wait_for_tunnel_url tunnel-be.log 30)
    if [ ! -z "$be_url" ]; then
        if [ -f "frontend/.env" ]; then
            perl -i -ne 'print unless /^VITE_API_URL=/' frontend/.env
        fi
        echo "VITE_API_URL=${be_url}/api" >> frontend/.env
        print_success "Updated frontend/.env with VITE_API_URL=${be_url}/api"
    else
        print_warning "Could not update .env: BE tunnel URL not found."
    fi
}

# Function to update VITE_TUNNEL_DOMAIN in frontend/.env
update_fe_env_tunnel_domain() {
    local fe_url=$(wait_for_tunnel_url tunnel-fe.log 30)
    if [ ! -z "$fe_url" ]; then
        local domain=$(echo "$fe_url" | perl -pe 's#https://([^/]+).*#$1#')
        if [ -f "frontend/.env" ]; then
            perl -i -ne 'print unless /^VITE_TUNNEL_DOMAIN=/' frontend/.env
        fi
        echo "VITE_TUNNEL_DOMAIN=$domain" >> frontend/.env
        print_success "Updated frontend/.env with VITE_TUNNEL_DOMAIN=$domain"
    else
        print_warning "Could not update .env: FE tunnel domain not found."
    fi
}

# Function to update .env for local mode
update_fe_env_local() {
    if [ -f "frontend/.env" ]; then
        perl -i -ne 'print unless /^VITE_API_URL=/' frontend/.env
        perl -i -ne 'print unless /^VITE_TUNNEL_DOMAIN=/' frontend/.env
    fi
    echo "VITE_API_URL=http://localhost:8080/api" >> frontend/.env
    echo "VITE_TUNNEL_DOMAIN=localhost" >> frontend/.env
    print_success "Updated frontend/.env with local API and tunnel domain"
}

# Function to print sticky tunnel URLs at the end
print_sticky_tunnel_urls() {
    local be_url=""
    local fe_url=""
    local waited=0
    local timeout=60 # tổng thời gian chờ tối đa (giây)
    while [ $waited -lt $timeout ]; do
        be_url=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' tunnel-be.log | head -n1)
        fe_url=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' tunnel-fe.log | head -n1)
        if [ ! -z "$be_url" ] && [ ! -z "$fe_url" ]; then
            break
        fi
        sleep 1
        waited=$((waited+1))
    done
    echo -e "\n==============================="
    echo -e "🌐 Backend Tunnel URL: ${be_url:-'(not found)'}"
    echo -e "🌐 Frontend Tunnel URL: ${fe_url:-'(not found)'}"
    echo -e "===============================\n"
}

# Function to start development environment
start_dev_environment() {
    print_status "Starting development environment in mode: $MODE"
    
    # Kill any processes using development ports
    kill_development_ports
    
    # Start PostgreSQL, Redis, and pgAdmin
    print_status "Starting database services (PostgreSQL, Redis, pgAdmin)..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis pgadmin
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres; do
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Run migrations and seed data
    print_status "Setting up database schema and initial data..."
    run_migrations
    seed_database
    
    if [ "$MODE" = "tunnel" ]; then
        start_cloudflared_tunnel 8080 "backend" tunnel-be.log
        update_fe_env_api_url
        start_cloudflared_tunnel 5173 "frontend" tunnel-fe.log
        update_fe_env_tunnel_domain
    fi
    if [ "$MODE" = "local" ]; then
        update_fe_env_local
    fi
    # Start backend với hot reload
    print_status "Starting backend with hot reload..."
    start_backend_npm
    # Start frontend với npm
    print_status "Starting frontend with npm..."
    start_frontend_npm
    if [ "$MODE" = "tunnel" ]; then
        print_sticky_tunnel_urls
    fi
    print_success "Development environment started successfully!"
}

# Function to start backend with hot reload
start_backend_npm() {
    # Check if backend dependencies are installed
    if [ ! -f "backend/go.sum" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        go mod tidy
        cd ..
    fi
    
    # Start backend in background with air
    print_status "Starting backend development server..."
    cd backend
    air &
    BACKEND_PID=$!
    cd ..
    
    # Save PID to file for later cleanup
    echo $BACKEND_PID > .backend.pid
    
    print_success "Backend started via air (PID: $BACKEND_PID)"
}

# Function to start frontend with npm
start_frontend_npm() {
    # Check if frontend dependencies are installed
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Start frontend in background
    print_status "Starting frontend development server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Save PID to file for later cleanup
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "Frontend started via npm (PID: $FRONTEND_PID)"
}

# Function to stop backend air process
stop_backend_npm() {
    if [ -f ".backend.pid" ]; then
        local pid=$(cat .backend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping backend air process..."
            kill $pid
            rm .backend.pid
            print_success "Backend air process stopped"
        fi
    fi
}

# Function to stop frontend npm process
stop_frontend_npm() {
    if [ -f ".frontend.pid" ]; then
        local pid=$(cat .frontend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping frontend npm process..."
            kill $pid
            rm .frontend.pid
            print_success "Frontend npm process stopped"
        fi
    fi
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    echo "📊 PostgreSQL: http://localhost:5433"
    echo "   - Database: food_pos"
    echo "   - Username: postgres"
    echo "   - Password: password"
    echo ""
    echo "🔴 Redis: http://localhost:6379"
    echo ""
    echo "🗄️  pgAdmin: http://localhost:5050"
    echo "   - Email: admin@foodpos.com"
    echo "   - Password: admin123"
    echo ""
    echo "🚀 Backend API: http://localhost:8080"
    echo "   - Health check: http://localhost:8080/health"
    echo ""
    echo "⚛️  Frontend: http://localhost:5173 (npm)"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Check if PostgreSQL is running
    if ! docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start the development environment first."
        return 1
    fi

    # Copy migration files to container
    print_status "Copying migration files to PostgreSQL container..."
    docker cp backend/migrations/001_create_order_status_enum.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/002_create_products_table.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/003_create_users_table.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/004_create_variants_table.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/005_create_ingredients_table.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/006_create_variant_ingredients_table.up.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/007_create_orders_table.up.sql food_pos_postgres_dev:/tmp/
    # Nếu có shippers:
    if [ -f backend/migrations/008_create_shippers.up.sql ]; then
        docker cp backend/migrations/008_create_shippers.up.sql food_pos_postgres_dev:/tmp/
    fi

    # Run migrations in order
    print_status "Running migration: 001_create_order_status_enum.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/001_create_order_status_enum.up.sql

    print_status "Running migration: 002_create_products_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/002_create_products_table.up.sql

    print_status "Running migration: 003_create_users_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/003_create_users_table.up.sql

    print_status "Running migration: 004_create_variants_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/004_create_variants_table.up.sql

    print_status "Running migration: 005_create_ingredients_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/005_create_ingredients_table.up.sql

    print_status "Running migration: 006_create_variant_ingredients_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/006_create_variant_ingredients_table.up.sql

    print_status "Running migration: 007_create_orders_table.up.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/007_create_orders_table.up.sql

    # Nếu có shippers:
    if [ -f backend/migrations/008_create_shippers.up.sql ]; then
        print_status "Running migration: 008_create_shippers.up.sql"
        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/008_create_shippers.up.sql
    fi

    print_success "Database migrations completed successfully!"
}

# Function to rollback database migrations
rollback_migrations() {
    print_status "Rolling back database migrations..."
    
    # Check if PostgreSQL is running
    if ! docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start the development environment first."
        return 1
    fi
    
    # Copy migration files to container
    print_status "Copying migration files to PostgreSQL container..."
    docker cp backend/migrations/002_create_variants_table.down.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/001_create_products_table.down.sql food_pos_postgres_dev:/tmp/
    docker cp backend/migrations/001_create_users_table.down.sql food_pos_postgres_dev:/tmp/
    
    # Run rollbacks in reverse order
    print_status "Rolling back migration: 002_create_variants_table.down.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/002_create_variants_table.down.sql
    
    print_status "Rolling back migration: 001_create_products_table.down.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/001_create_products_table.down.sql
    
    print_status "Rolling back migration: 001_create_users_table.down.sql"
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -f /tmp/001_create_users_table.down.sql
    
    print_success "Database rollback completed successfully!"
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."

    # Check if PostgreSQL is running
    if ! docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start the development environment first."
        return 1
    fi

    # Check if migrations have been run
    local table_count=$(docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d food_pos -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

    if [ "$table_count" -eq "0" ]; then
        print_warning "No tables found. Running migrations first..."
        run_migrations
    fi

    # Run seed script with correct connection string
    print_status "Running seed script..."
    cd backend
    DB_URL="postgres://postgres:password@localhost:5433/food_pos?sslmode=disable" go run cmd/seed_db/main.go
    cd ..

    print_success "Database seeding completed successfully!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    stop_backend_npm
    stop_frontend_npm
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    print_success "Cleanup completed"
}

# Main script
MODE="${1:-local}"

main() {
    echo ""
    echo "🍽️  3 O'CLOCK Development Environment Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_docker_compose
    check_node
    
    # Setup environment
    setup_env_file
    
    # Stop existing containers and processes
    stop_containers
    stop_backend_npm
    stop_frontend_npm
    
    # Start development environment
    start_dev_environment
    
    # Show status
    show_status
    
    print_success "Development environment is ready!"
    echo ""
    print_status "Useful commands:"
    echo "  ./dev-local.sh logs     - Show logs"
    echo "  ./dev-local.sh stop     - Stop all services"
    echo "  ./dev-local.sh restart  - Restart all services"
    echo "  ./dev-local.sh status   - Show service status"
    echo "  ./dev-local.sh cleanup  - Clean up everything"
    echo ""
    print_warning "Frontend is running via npm. Use 'pkill -f \"npm run dev\"' to stop it manually."
}

# Handle command line arguments
case "${1:-}" in
    "logs")
        show_logs
        ;;
    "stop")
        print_status "Stopping all services..."
        stop_backend_npm
        stop_frontend_npm
        docker-compose -f docker-compose.dev.yml down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose -f docker-compose.dev.yml restart
        print_success "All services restarted"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "migrate")
        run_migrations
        ;;
    "rollback")
        rollback_migrations
        ;;
    "seed")
        seed_database
        ;;
    "killports")
        kill_development_ports
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./dev-local.sh [local|tunnel|command]"
        echo ""
        echo "Commands:"
        echo "  local     - Start dev environment WITHOUT tunnel (pure local)"
        echo "  tunnel    - Start dev environment WITH Cloudflare tunnel (default)"
        echo "  logs      - Show logs"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  cleanup   - Clean up everything"
        echo "  migrate   - Run database migrations"
        echo "  rollback  - Rollback database migrations"
        echo "  seed      - Seed database"
        echo "  killports - Kill processes on development ports"
        echo "  help      - Show this help"
        echo ""
        echo "Note: Frontend runs with npm run dev, backend runs with Docker"
        ;;
    ""|"local"|"tunnel")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use './dev-local.sh help' for usage information"
        exit 1
        ;;
esac 