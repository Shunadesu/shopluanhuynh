# 🎯 Hướng Dẫn Sử Dụng Tính Năng Filter Nâng Cao

## ✨ Tính năng mới

Đã thêm thanh filter nâng cao vào trang Home với các chức năng:

### 1. **Dropdown Khoảng Giá**
- Tất cả
- Dưới 50.000đ
- 50.000đ - 100.000đ
- 100.000đ - 500.000đ
- Trên 500.000đ

**Cách hoạt động**: Chọn khoảng giá → Áp dụng ngay lập tức (instant filter)

### 2. **Dropdown Sắp Xếp**
- Mặc định (mới nhất)
- Giá: Thấp → Cao
- Giá: Cao → Thấp
- Tên: A → Z
- Tên: Z → A

**Cách hoạt động**: Chọn kiểu sắp xếp → Áp dụng ngay lập tức

### 3. **Tìm Kiếm Tên Sản Phẩm**
Nhập tên tài khoản cần tìm (không phân biệt hoa/thường)

**Cách hoạt động**: Nhập text → Nhấn nút "Tìm kiếm" để áp dụng

### 4. **Tìm Kiếm Mã Tài Khoản**
Nhập mã tài khoản (VD: ACC123)

**Cách hoạt động**: Nhập mã → Nhấn nút "Tìm kiếm" để áp dụng

### 5. **Nút Tìm Kiếm**
Áp dụng các bộ lọc tìm kiếm theo tên và mã

### 6. **Nút Hủy Bỏ**
Reset tất cả filter về mặc định

### 7. **Badge Hiển Thị Filter Active**
Hiển thị các filter đang được áp dụng ngay bên dưới thanh filter

### 8. **Hiển Thị Mã Tài Khoản**
Mỗi tài khoản giờ có badge hiển thị mã duy nhất (VD: Mã: ACCXXX)

---

## 🔧 Thay đổi Backend

### 1. Schema GameAccount
**File**: `server/models/GameAccount.js`

```javascript
code: {
  type: String,
  unique: true,
  sparse: true,
  default: function() {
    return 'ACC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  }
}
```

### 2. API Accounts
**File**: `server/routes/accounts.js`

Thêm query params:
- `code`: Tìm kiếm theo mã tài khoản
- `sortBy`: Sắp xếp (price_asc, price_desc, name_asc, name_desc)

**Endpoint**: `GET /api/accounts?code=ACC123&sortBy=price_asc`

---

## 🎨 Thay đổi Frontend

### 1. Home.jsx
**File**: `frontend/src/pages/Home.jsx`

**State mới**:
```javascript
const [filters, setFilters] = useState({
  priceRange: 'all',
  sortBy: 'default',
  searchName: '',
  searchCode: '',
});
```

**Filter logic**: Kết hợp category + giá + tên + mã + sắp xếp

### 2. AccountCard.jsx
**File**: `frontend/src/components/AccountCard.jsx`

Thêm hiển thị mã tài khoản bên dưới title

---

## 📝 Migration Script

**File**: `server/scripts/generateAccountCodes.js`

Tự động tạo mã cho các tài khoản cũ chưa có code.

**Chạy script**:
```bash
cd server
node scripts/generateAccountCodes.js
```

---

## 🧪 Testing

### Test Cases:
1. ✅ Filter theo khoảng giá
2. ✅ Sắp xếp theo giá (tăng/giảm)
3. ✅ Sắp xếp theo tên (A-Z/Z-A)
4. ✅ Tìm kiếm theo tên (có/không dấu)
5. ✅ Tìm kiếm theo mã tài khoản
6. ✅ Kết hợp nhiều filter cùng lúc
7. ✅ Reset filter về mặc định
8. ✅ Responsive trên mobile
9. ✅ Badge hiển thị filter đang active
10. ✅ Auto scroll xuống kết quả

### Test Manually:
1. Mở trang Home: http://localhost:9004
2. Chọn danh mục
3. Thử các filter khác nhau
4. Kiểm tra kết quả và số lượng tài khoản
5. Test responsive trên mobile (F12 > Device toolbar)

---

## 🚀 Performance

- **Instant filter**: Dropdown giá và sắp xếp áp dụng ngay
- **Search on button**: Tìm kiếm tên/mã chỉ áp dụng khi nhấn nút
- **useMemo**: Tối ưu render với memo
- **Auto scroll**: Smooth scroll xuống kết quả

---

## 📱 Responsive Design

- **Desktop**: Tất cả filter trên 1 hàng
- **Tablet**: Wrap xuống 2 hàng
- **Mobile**: Stack dọc, full width

---

## 🎯 UX Enhancements

1. **Visual feedback**: Active filter hiển thị bằng badge màu primary
2. **Smart labels**: Label rõ ràng cho từng filter
3. **Placeholder**: Gợi ý cách nhập (VD: ACC123)
4. **Icon**: FiSearch và FiX cho nút
5. **Count display**: Hiển thị số lượng tài khoản tìm thấy

---

## 🔮 Future Enhancements

- [ ] Filter theo rank
- [ ] Filter theo server
- [ ] Filter theo BP range
- [ ] Filter theo team value
- [ ] Lưu filter vào localStorage
- [ ] Share filter qua URL
- [ ] Advanced filter modal
- [ ] Filter history
- [ ] Saved searches

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Server đang chạy (http://localhost:9003)
2. Frontend đang chạy (http://localhost:9004)
3. MongoDB đã connect
4. Console log có error không

---

**Phát triển bởi**: Cursor AI Agent  
**Ngày**: 9/9/2026  
**Version**: 1.0.0
