# User & Order Management Logic

## 1. User Types

- **Guest user**: Chỉ có thông tin cơ bản (tên, sđt, email), chưa đăng ký tài khoản, is_guest=true.
- **Registered user**: Đã đăng ký tài khoản, có thể đăng nhập, is_guest=false.

## 2. Order Creation Flows

### A. Client Portal

- Nếu đã đăng nhập: lấy user_id từ session/token, tạo order gán user_id.
- Nếu chưa đăng nhập (guest checkout): nhập info khách, tìm hoặc tạo user guest, tạo order gán user_id.

### B. Admin Page

- Nhập info khách (tên, sđt, email...)
- Tìm user theo phone/email:
  - Nếu có: lấy user_id, tạo order gán user_id.
  - Nếu không: tạo user guest, tạo order gán user_id.

## 3. Đăng ký tài khoản

- Khi khách đăng ký, tìm user guest theo phone/email:
  - Nếu có: update thành registered (set password, is_guest=false).
  - Nếu không: tạo user mới.

## 4. Database Design

- Bảng `users`: id, name, phone, email, password (nullable), is_guest (bool), ...
- Bảng `orders`: id, user_id, ...

## 5. Checklist (phần còn lại)

- [ ] Viết logic đăng ký chuyển user guest thành registered nếu trùng phone/email
- [ ] Đảm bảo API tạo order dùng chung cho cả client portal và admin page
- [ ] Đảm bảo không bị trùng user khi khách đăng ký sau này
- [ ] (Tùy chọn) Thêm tracking source tạo user (guest, admin, self-register...)
- [ ] Khi tạo order, nếu user cũ chỉ có email hoặc phone, lần sau nhập thêm thì update bổ sung vào user đó (không tạo user mới, không ghi đè info đã có)

---

## 6. Ưu điểm

- Đơn giản, không cần merge order phức tạp
- Không bị trùng user
- Dễ mở rộng loyalty, tích điểm, lịch sử mua hàng
- Dễ maintain, tracking
