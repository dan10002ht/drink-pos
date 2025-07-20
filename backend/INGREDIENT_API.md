# Ingredient API Documentation

## Tổng quan

API này cho phép quản lý ingredients (nguyên liệu) và tính toán giá cost cho các variant của product dựa trên các ingredient được sử dụng.

## Cấu trúc Database

### Bảng `ingredients`

- `id`: UUID (Primary Key)
- `public_id`: UUID (Unique, Public ID)
- `name`: VARCHAR(200) - Tên nguyên liệu
- `unit_price`: DECIMAL(10,2) - Đơn giá nguyên liệu
- `unit`: VARCHAR(50) - Đơn vị (kg, lít, quả, etc.)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Bảng `variant_ingredients`

- `id`: UUID (Primary Key)
- `variant_id`: UUID (Foreign Key to variants)
- `ingredient_id`: UUID (Foreign Key to ingredients)
- `quantity`: DECIMAL(10,3) - Số lượng nguyên liệu sử dụng
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Bảng `variants` (đã cập nhật)

- Thêm trường `cost`: DECIMAL(10,2) - Giá cost được tính từ ingredients

## API Endpoints

### 1. Quản lý Ingredients

#### Tạo ingredient mới

```http
POST /api/admin/ingredients
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Bột mì",
  "unit_price": 15000,
  "unit": "kg"
}
```

#### Lấy danh sách ingredients

```http
GET /api/admin/ingredients
Authorization: Bearer <token>
```

#### Lấy ingredient theo ID

```http
GET /api/admin/ingredients/{public_id}
Authorization: Bearer <token>
```

#### Cập nhật ingredient

```http
PUT /api/admin/ingredients/{public_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Bột mì cao cấp",
  "unit_price": 18000,
  "unit": "kg"
}
```

#### Xóa ingredient

```http
DELETE /api/admin/ingredients/{public_id}
Authorization: Bearer <token>
```

### 2. Quản lý Variant-Ingredients

#### Lấy danh sách ingredients của variant

```http
GET /api/admin/variants/{variant_public_id}/ingredients
Authorization: Bearer <token>
```

#### Thêm ingredient vào variant

```http
POST /api/admin/variants/{variant_public_id}/ingredients
Content-Type: application/json
Authorization: Bearer <token>

{
  "ingredient_id": "ingredient_public_id",
  "quantity": 0.5
}
```

#### Xóa ingredient khỏi variant

```http
DELETE /api/admin/variants/{variant_public_id}/ingredients/{ingredient_public_id}
Authorization: Bearer <token>
```

#### Tính toán cost của variant

```http
GET /api/admin/variants/{variant_public_id}/cost
Authorization: Bearer <token>
```

### 3. Tạo Product với Ingredients

#### Tạo product với variants và ingredients

```http
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Bánh mì",
  "variants": [
    {
      "name": "Bánh mì trắng",
      "price": 15000,
      "ingredients": [
        {
          "ingredient_id": "ingredient_public_id_1",
          "quantity": 0.3
        },
        {
          "ingredient_id": "ingredient_public_id_2",
          "quantity": 0.1
        }
      ]
    }
  ]
}
```

## Cách tính Cost

Cost của variant được tính bằng công thức:

```
Cost = Σ(quantity × unit_price) của tất cả ingredients trong variant
```

Ví dụ:

- Bột mì: 0.3kg × 15,000đ/kg = 4,500đ
- Đường: 0.1kg × 20,000đ/kg = 2,000đ
- **Tổng cost = 6,500đ**

## Response Examples

### Ingredient Response

```json
{
  "id": "uuid",
  "public_id": "public_uuid",
  "name": "Bột mì",
  "unit_price": 15000,
  "unit": "kg",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Variant with Ingredients Response

```json
{
  "id": "uuid",
  "public_id": "public_uuid",
  "product_id": "product_uuid",
  "name": "Bánh mì trắng",
  "price": 15000,
  "cost": 6500,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "ingredients": [
    {
      "id": "uuid",
      "variant_id": "variant_uuid",
      "ingredient_id": "ingredient_uuid",
      "quantity": 0.3,
      "ingredient": {
        "id": "uuid",
        "public_id": "public_uuid",
        "name": "Bột mì",
        "unit_price": 15000,
        "unit": "kg",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Lưu ý

1. **Giá bán (price)**: Do người dùng nhập thủ công
2. **Giá cost**: Được tính tự động từ ingredients
3. **Profit margin**: Có thể tính bằng `price - cost`
4. Khi thêm/xóa ingredient khỏi variant, cost sẽ được tính lại tự động
5. Tất cả API đều yêu cầu authentication và admin role
