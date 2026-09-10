# 🚨 FIX LỖI EMAIL INDEX TRÊN PRODUCTION

## Vấn Đề Hiện Tại

Server production đang gặp lỗi:
```
E11000 duplicate key error collection: test.users index: email_1 dup key: { email: null }
```

**Nguyên nhân**: 
1. Server vẫn kết nối vào database `test` (chứ không phải `shopluanhuynh`)
2. Database `test` có index cũ `email_1` (unique) nhưng User model không còn field `email`
3. File `.env` đã sửa nhưng **server chưa restart** nên vẫn dùng config cũ

## Giải Pháp Khẩn Cấp

### Bước 1: SSH vào server production
```bash
ssh user@your-server
cd /www/wwwroot/be_shopluanhuynh
```

### Bước 2: Kiểm tra .env hiện tại
```bash
cat .env | grep MONGODB_URI
```

**Phải thấy:**
```
MONGODB_URI=mongodb+srv://namp280918_db_user:Yf6q9rV5stcBi0XS@cluster0.8vmhbea.mongodb.net/shopluanhuynh
```

**Nếu thiếu `/shopluanhuynh` ở cuối, sửa ngay:**
```bash
nano .env
# Thêm /shopluanhuynh vào cuối MONGODB_URI
# Ctrl+X, Y, Enter để lưu
```

### Bước 3: Upload script fix lên server
```bash
# Từ máy local:
scp D:/web_client/shopluanhuynh/server/scripts/fixProductionOldIndex.js user@server:/www/wwwroot/be_shopluanhuynh/scripts/
```

### Bước 4: Chạy script fix (Xóa index cũ)
```bash
# Trên server:
cd /www/wwwroot/be_shopluanhuynh
node scripts/fixProductionOldIndex.js
```

**Kết quả mong đợi:**
```
✅ Connected to database: "test" (hoặc "shopluanhuynh")
🗑️  Dropping old index: email_1...
✅ Successfully dropped email_1 index
✅ Index username_1 (unique) ready
```

### Bước 5: RESTART SERVER (QUAN TRỌNG!)
```bash
pm2 restart be_shopluanhuynh
pm2 logs be_shopluanhuynh
```

**Kiểm tra log phải thấy:**
```
✅ Connected to MongoDB
🚀 Server is running on http://localhost:9003
```

### Bước 6: Test đăng ký
```bash
curl -X POST https://luanhuynhfc.shop/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser999",
    "password": "123456",
    "fullName": "Test User",
    "phone": "0123456789"
  }'
```

**Response thành công:**
```json
{
  "message": "Đăng ký thành công",
  "token": "eyJhbGci...",
  "user": {
    "username": "testuser999",
    "fullName": "Test User",
    ...
  }
}
```

## Nếu Vẫn Lỗi

### Tình huống 1: Script báo kết nối vào database "test"
→ `.env` chưa được cập nhật hoặc server chưa restart

**Giải pháp:**
```bash
# Sửa .env
nano .env
# Đảm bảo có: MONGODB_URI=...mongodb.net/shopluanhuynh

# Restart
pm2 restart be_shopluanhuynh

# Chạy lại script
node scripts/fixProductionOldIndex.js
```

### Tình huống 2: Vẫn lỗi email_1 sau khi chạy script
→ Index chưa bị xóa hoàn toàn

**Giải pháp:** Xóa thủ công qua MongoDB Compass hoặc shell:
```javascript
// Kết nối vào MongoDB Atlas
use test  // hoặc use shopluanhuynh

// Xóa index
db.users.dropIndex("email_1")

// Verify
db.users.getIndexes()
// Chỉ còn: _id_ và username_1
```

### Tình huống 3: Database có nhiều users với email=null
→ Chỉ được phép 1 user có email=null khi index unique

**Giải pháp:**
```bash
node scripts/fixProductionOldIndex.js
# Script sẽ xóa index email_1
# Sau đó các user với email=null không còn conflict
```

## Checklist Hoàn Thành

- [ ] `.env` có `/shopluanhuynh` ở cuối MONGODB_URI
- [ ] Chạy script `fixProductionOldIndex.js` thành công
- [ ] Index `email_1` đã bị xóa
- [ ] Index `username_1` (unique) đã được tạo
- [ ] Server đã restart bằng `pm2 restart`
- [ ] Test đăng ký thành công
- [ ] User mới hiển thị ở admin panel

## Script Liên Quan

- `scripts/fixProductionOldIndex.js` - Xóa index cũ, tạo index mới
- `scripts/testRegister.js` - Test đăng ký local
- `scripts/cleanupTestUsers.js` - Xóa test users

## Tài Liệu Tham Khảo

- [FIX_DUPLICATE_USERNAME_SUMMARY.md](./FIX_DUPLICATE_USERNAME_SUMMARY.md)
- [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)

---
**Lưu ý:** Sau khi fix xong, **KHÔNG XÓA** script `fixProductionOldIndex.js` - giữ lại để dùng khi cần.
