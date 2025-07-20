# 3 O'CLOCK Backend

Backend API cho hệ thống 3 O'CLOCK được xây dựng bằng Go với Gin framework và Repository Pattern.

## Cấu trúc dự án

```
backend/
├── config/                 # Cấu hình ứng dụng
├── internal/              # Code nội bộ của ứng dụng
│   ├── handler/           # HTTP handlers
│   ├── service/           # Business logic
│   ├── repository/        # Data access layer
│   └── middleware/        # Middleware
├── pkg/                   # Package có thể tái sử dụng
│   └── response/          # Response utilities
├── main.go               # Entry point
├── go.mod               # Go modules
└── env.example          # Environment variables example
```

## Cài đặt

1. Clone repository
2. Cài đặt Go (version 1.19+)
3. Chạy lệnh:

```bash
cd backend
go mod tidy
```

## Chạy ứng dụng

```bash
go run main.go
```

Server sẽ chạy tại `http://localhost:8080`

## API Endpoints

- `GET /api/example` - Example endpoint

## Environment Variables

Copy file `env.example` thành `.env` và cấu hình:

- `PORT` - Port server (default: 8080)
- `ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

## Repository Pattern

Dự án sử dụng Repository Pattern với 3 layer:

1. **Handler Layer**: Xử lý HTTP requests/responses
2. **Service Layer**: Business logic
3. **Repository Layer**: Data access

## Middleware

- CORS middleware cho phép frontend gọi API
- Logger middleware để log requests
- Recovery middleware để handle panics
