# Shop Luan Huynh

Shop bán tài khoản game với các tính năng: mua bán tài khoản game, hệ thống nạp tiền, quản lý đơn hàng và Admin panel.

## Công nghệ sử dụng

### Frontend
- React + Vite
- Tailwind CSS
- React Router DOM
- TanStack Query
- Zustand (state management)
- Framer Motion (animations)
- Swiper (carousel)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- AES-256-CBC (credentials encryption)
- Multer (file upload)

### Admin Panel
- React + Vite
- Tailwind CSS
- Recharts (dashboard charts)
- React Hook Form

## Cài đặt

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Admin Panel
```bash
cd admin
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=9003
MONGODB_URI=mongodb://localhost:27017/shopluanhuynh
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
ENCRYPTION_KEY=32_character_encryption_key_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:9003
```

### Admin (.env)
```env
VITE_API_URL=http://localhost:9003
```

## Tính năng chính

### Frontend
- Hero slider với banner quảng cáo
- Danh sách tài khoản game theo danh mục
- Bộ lọc và tìm kiếm nâng cao
- Giỏ hàng và thanh toán
- Hệ thống nạp tiền qua chuyển khoản
- Xem chi tiết tài khoản đã mua
- Thông báo popup
- Responsive design (mobile-first)

### Admin Panel
- Dashboard với thống kê doanh thu
- Quản lý danh mục game
- Quản lý tài khoản game
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý nạp tiền
- Quản lý sliders
- Quản lý thông báo
- Quản lý tài khoản ngân hàng
- Quản lý logo
- Quản lý mạng xã hội

## Đăng nhập mặc định

- **Email:** admin@shopluanhuynh.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Accounts
- `GET /api/accounts` - Danh sách tài khoản
- `GET /api/accounts/:id` - Chi tiết tài khoản

### Categories
- `GET /api/categories` - Danh sách danh mục

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ hàng
- `DELETE /api/cart/:accountId` - Xóa khỏi giỏ hàng

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng của user
- `GET /api/orders/:id` - Chi tiết đơn hàng

### Deposits
- `POST /api/deposits` - Tạo yêu cầu nạp tiền
- `GET /api/deposits` - Lịch sử nạp tiền

### Bank Accounts
- `GET /api/bank-accounts` - Danh sách tài khoản ngân hàng

### Settings
- `GET /api/settings` - Lấy cài đặt site
- `GET /api/social-links` - Lấy links mạng xã hội

### Uploads
- `POST /api/upload/image` - Upload hình ảnh

## Cấu trúc thư mục

```
shopluanhuynh/
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Middlewares
│   ├── src/              # Source code (controllers, models, routes)
│   ├── utils/            # Utilities
│   └── index.js          # Entry point
├── frontend/              # Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   └── utils/       # Utilities
│   └── index.html
├── admin/                 # Admin Panel
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   └── utils/       # Utilities
│   └── index.html
├── README.md
└── .env.example
```

## License

MIT
