# Shopluanhuynh - Hệ thống bán tài khoản game

Dự án bao gồm 3 phần: Backend API, Frontend (Khách hàng), và Admin Panel.

## 🚀 Cấu trúc dự án

```
shopluanhuynh/
├── server/          # Backend API (Node.js + Express + MongoDB)
├── frontend/        # Giao diện khách hàng (React + Vite)
└── admin/          # Giao diện quản trị (React + Vite)
```

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Backend Server

```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server`:

```env
PORT=9003
MONGODB_URI=mongodb://localhost:27017/shopluanhuynh
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:9010
ADMIN_URL=http://localhost:5174
NODE_ENV=development
```

### 2. Frontend (Khách hàng)

```bash
cd frontend
npm install
```

### 3. Admin Panel

```bash
cd admin
npm install
```

## 🎯 Chạy dự án

### Chạy tất cả (3 terminal riêng biệt)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server chạy tại: http://localhost:9003

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend chạy tại: http://localhost:9010

**Terminal 3 - Admin:**
```bash
cd admin
npm run dev
```
Admin chạy tại: http://localhost:5174

## 👤 Tài khoản mặc định

Sau khi chạy server lần đầu, cần tạo tài khoản admin:

1. Truy cập frontend và đăng ký tài khoản mới
2. Vào MongoDB và set `isAdmin: true` cho tài khoản đó
3. Hoặc chạy script seed (nếu có)

## 📱 Tính năng

### Frontend (Khách hàng)
- ✅ Xem danh sách tài khoản game
- ✅ Lọc theo danh mục
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng
- ✅ Đặt hàng
- ✅ Nạp tiền qua chuyển khoản
- ✅ Quản lý đơn hàng cá nhân
- ✅ Lịch sử nạp tiền

### Admin Panel
- ✅ Dashboard tổng quan
- ✅ Quản lý danh mục
- ✅ Quản lý tài khoản game
- ✅ Quản lý đơn hàng
- ✅ Duyệt yêu cầu nạp tiền
- ✅ Quản lý người dùng
- ✅ Quản lý banner slider
- ✅ Cài đặt hệ thống

## 🛠️ Tech Stack

### Backend
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Express Validator
- Multer (upload file)
- Nodemailer

### Frontend & Admin
- React 18/19
- Vite
- TailwindCSS
- React Router
- React Query (TanStack Query)
- Zustand (State Management)
- React Hook Form
- Axios
- React Hot Toast
- React Icons
- Date-fns

### Frontend specific
- Swiper (slider)
- Framer Motion (animations)
- Yup (validation)

### Admin specific
- Recharts (charts/graphs)

## 📝 API Endpoints

### Auth
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- GET `/api/auth/profile` - Lấy thông tin user

### Categories
- GET `/api/categories` - Danh sách danh mục
- POST `/api/admin/categories` - Tạo danh mục (Admin)
- PUT `/api/admin/categories/:id` - Sửa danh mục (Admin)
- DELETE `/api/admin/categories/:id` - Xóa danh mục (Admin)

### Accounts (Game Accounts)
- GET `/api/accounts` - Danh sách tài khoản
- GET `/api/accounts/:id` - Chi tiết tài khoản
- POST `/api/admin/accounts` - Tạo tài khoản (Admin)
- PUT `/api/admin/accounts/:id` - Sửa tài khoản (Admin)
- DELETE `/api/admin/accounts/:id` - Xóa tài khoản (Admin)

### Orders
- POST `/api/orders` - Tạo đơn hàng
- GET `/api/orders` - Lịch sử đơn hàng
- GET `/api/orders/:id` - Chi tiết đơn hàng
- GET `/api/admin/orders` - Tất cả đơn hàng (Admin)
- PUT `/api/admin/orders/:id/status` - Cập nhật trạng thái (Admin)

### Deposits
- POST `/api/deposits` - Tạo yêu cầu nạp tiền
- GET `/api/deposits` - Lịch sử nạp tiền
- GET `/api/admin/deposits` - Tất cả yêu cầu (Admin)
- PUT `/api/admin/deposits/:id` - Duyệt/từ chối (Admin)

### Settings
- GET `/api/settings` - Lấy cài đặt
- PUT `/api/admin/settings` - Cập nhật cài đặt (Admin)
- GET `/api/settings/sliders` - Danh sách banner
- POST `/api/admin/sliders` - Tạo banner (Admin)
- PUT `/api/admin/sliders/:id` - Sửa banner (Admin)
- DELETE `/api/admin/sliders/:id` - Xóa banner (Admin)

## 🎨 Giao diện

### Màu sắc chính
- Primary: `#D84315` (Deep Orange)
- Dark: `#0B0E14` (Deep Navy)
- Dark Light: `#0F172A` (Slate 900)
- Accent: `#22D3EE` (Cyan 400)

### Font
- Inter (Google Fonts)

## 📦 Build Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

### Admin
```bash
cd admin
npm run build
npm run preview
```

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra MONGODB_URI trong file .env

### Lỗi CORS
- Kiểm tra CLIENT_URL và ADMIN_URL trong .env
- Đảm bảo port khớp với port đang chạy

### Lỗi port đã được sử dụng
- Frontend và Admin tự động tìm port khác nếu bị trùng
- Backend cần thay đổi PORT trong .env nếu bị trùng

## 📄 License

MIT

## 👨‍💻 Developer

Shopluanhuynh - LuanHuynhFCO

---

**Chúc bạn thành công! 🎉**
