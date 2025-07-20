# 3 O'CLOCK - Development Guide

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Go 1.21+ (for backend development - optional, since we use Docker)

### Start Development Environment

```bash
# Start all services (PostgreSQL, Redis, pgAdmin, Backend, Frontend)
./dev-local.sh

# Or with specific commands:
./dev-local.sh help     # Show all available commands
./dev-local.sh status   # Show service status
./dev-local.sh logs     # Show logs
./dev-local.sh stop     # Stop all services
```

## 📊 Services

| Service         | URL                   | Credentials                  |
| --------------- | --------------------- | ---------------------------- |
| **Backend API** | http://localhost:8080 | -                            |
| **Frontend**    | http://localhost:5173 | -                            |
| **PostgreSQL**  | localhost:5433        | `postgres/password`          |
| **Redis**       | localhost:6379        | -                            |
| **pgAdmin**     | http://localhost:5050 | `admin@foodpos.com/admin123` |

## 🛠️ Development Commands

### Backend (Go)

```bash
# Run with hot reload (via Docker)
./dev-local.sh

# Run locally (if you have Go installed)
cd backend
go mod tidy
go run main.go

# Run with Air (hot reload)
air
```

### Frontend (React)

```bash
# Frontend is automatically started by dev-local.sh
# But you can also run manually:
cd frontend
npm install
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database

```bash
# Connect to PostgreSQL
docker exec -it food_pos_postgres_dev psql -U postgres -d food_pos

# Connect from local machine (if you have psql installed)
psql -h localhost -p 5433 -U postgres -d food_pos

# View logs
./dev-local.sh logs

# Reset database
docker-compose -f docker-compose.dev.yml down -v
./dev-local.sh
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=8080
ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=food_pos

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

### Docker Environment

The backend container uses these environment variables:

- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=password`
- `DB_NAME=food_pos`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`

## 📁 Project Structure

```
food-pos/
├── backend/                 # Go backend
│   ├── cmd/                # Application entrypoints
│   ├── internal/           # Private application code
│   │   ├── handler/        # HTTP handlers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access layer
│   │   └── middleware/     # HTTP middleware
│   ├── pkg/                # Public libraries
│   ├── config/             # Configuration
│   ├── migrations/         # Database migrations
│   └── main.go            # Main application
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Routing
│   │   ├── api/            # API functions
│   │   └── utils/          # Utility functions
│   └── package.json
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── dev-local.sh           # Development script
```

## 🔍 Debugging

### Backend Logs

```bash
# View backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f postgres
docker-compose -f docker-compose.dev.yml logs -f redis
```

### Frontend Logs

```bash
# Frontend logs are shown in the terminal where dev-local.sh is running
# Or check the browser console for errors
```

### Database Debugging

```bash
# Connect to PostgreSQL
docker exec -it food_pos_postgres_dev psql -U postgres -d food_pos

# Connect from local machine (if you have psql installed)
psql -h localhost -p 5433 -U postgres -d food_pos

# List tables
\dt

# View data
SELECT * FROM users;
```

### Frontend Debugging

- Open browser DevTools
- Check Network tab for API calls
- Check Console for errors

## 🧪 Testing

### Backend Tests

```bash
cd backend
go test ./...
go test -v ./...
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
go build -o main .

# Or use Docker
docker-compose up --build
```

## 📝 Common Issues

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8080
lsof -i :5433
lsof -i :6379
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Frontend Issues

```bash
# Stop frontend process
pkill -f "npm run dev"

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
./dev-local.sh
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the logs: `./dev-local.sh logs`
2. Check service status: `./dev-local.sh status`
3. Restart services: `./dev-local.sh restart`
4. Check this documentation
