# 3 O'CLOCK System

Hệ thống Point of Sale (POS) cho nhà hàng được xây dựng với React (Frontend) và Go (Backend).

## Cấu trúc dự án

```
food-pos/
├── frontend/              # React Frontend (sẽ tạo sau)
├── backend/              # Go Backend với Repository Pattern
│   ├── config/           # Cấu hình ứng dụng
│   ├── internal/         # Code nội bộ
│   │   ├── handler/      # HTTP handlers
│   │   ├── service/      # Business logic
│   │   ├── repository/   # Data access layer
│   │   └── middleware/   # Middleware
│   ├── pkg/              # Reusable packages
│   └── init.sql          # Database schema
├── docker-compose.yml    # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── README.md
```

## Cài đặt và chạy với Docker

### 1. Chạy chỉ database và services

```bash
# Chạy PostgreSQL, Redis, pgAdmin
docker-compose up -d

# Hoặc chạy development environment
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Chạy toàn bộ hệ thống (development)

```bash
# Chạy tất cả services bao gồm backend với hot reload
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Chạy production

```bash
# Build và chạy production
docker-compose up --build -d
```

## Services

Sau khi chạy Docker Compose, các services sẽ có sẵn tại:

- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050
  - Email: admin@foodpos.com
  - Password: admin123

## Database

Database PostgreSQL sẽ được khởi tạo tự động với:

- **Database**: food_pos
- **User**: postgres
- **Password**: password

### Schema đã được tạo:

- `users` - Quản lý người dùng
- `categories` - Danh mục sản phẩm
- `products` - Sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng

### Dữ liệu mẫu:

- Categories: Đồ uống, Món chính, Tráng miệng, Khai vị
- Products: Cà phê đen, Cà phê sữa, Phở bò, Bún chả, Kem dừa
- Admin user: admin@foodpos.com / admin123

## Development

### Backend (Go)

```bash
cd backend
go run main.go
```

### Hot Reload với Air

```bash
cd backend
go install github.com/cosmtrek/air@latest
air
```

## API Endpoints

- `GET /api/example` - Example endpoint

## Environment Variables

Copy file `backend/env.example` thành `.env` và cấu hình:

```env
PORT=8080
ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=food_pos
```

## Docker Commands

```bash
# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Xóa volumes (cẩn thận - sẽ mất dữ liệu)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## Troubleshooting

1. **Port conflicts**: Kiểm tra xem port 5432, 6379, 8080, 5050 có đang được sử dụng không
2. **Database connection**: Đảm bảo PostgreSQL đã khởi động hoàn toàn trước khi backend kết nối
3. **Permissions**: Đảm bảo Docker có quyền tạo volumes và networks
