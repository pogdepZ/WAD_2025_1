-- database/migrations/01_init.sql

-- Xóa bảng cũ nếu có (để chạy lại không lỗi)
DROP TABLE IF EXISTS users CASCADE;

-- 1. Bảng Users (Nhân viên trong nhà hàng)
-- Chỉ cần 3 role: admin (chủ), waiter (phục vụ), kitchen (bếp)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'waiter' CHECK (role IN ('admin', 'waiter', 'kitchen')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Data (Tạo sẵn tài khoản Chủ nhà hàng để test)
-- Password là '123456' (Trong thực tế sẽ hash, ở đây để text thường cho bạn dễ test logic trước)
INSERT INTO users (name, email, password, role) 
VALUES ('Chu Nha Hang', 'admin@gmail.com', '123456', 'admin');

-- Tạo thêm 1 nhân viên bếp để test
INSERT INTO users (name, email, password, role) 
VALUES ('Dau Bep', 'kitchen@gmail.com', '123456', 'kitchen');