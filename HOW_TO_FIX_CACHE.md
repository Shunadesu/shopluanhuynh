# Hướng dẫn khắc phục lỗi cache

## Vấn đề
Lỗi "Loại vòng quay không hợp lệ" xuất hiện mặc dù:
- Backend KHÔNG có validation về spinType
- Frontend đã được cleanup
- Model không có field spinType

## Nguyên nhân
Browser đang cache JavaScript bundle cũ (code trước khi cleanup)

## Giải pháp

### Bước 1: Clear Browser Cache
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn **"Empty Cache and Hard Reload"**

HOẶC:
- Ctrl + Shift + Delete → Clear cache → OK
- Ctrl + F5 để hard refresh

### Bước 2: Restart Frontend Dev Server
```bash
# Dừng server hiện tại (Ctrl+C trong terminal)
cd frontend
npm run dev
```

### Bước 3: Kiểm tra trong Browser DevTools

Mở Console (F12 → Console) và chạy:
```javascript
// Kiểm tra API trả về gì
fetch('http://localhost:9003/api/spin/config', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err))
```

### Bước 4: Nếu vẫn lỗi

Check Network tab (F12 → Network):
- Filter: XHR
- Tìm request `/api/spin/config`
- Xem Response trả về gì

## Xác nhận code đã đúng

✅ Backend route `/api/spin/config` (spin.js:14-40):
- KHÔNG check spinType
- Chỉ query: `isActive: true` và có stock

✅ Frontend hook `useSpinConfig()` (useSpin.js:7-28):
- Gọi: `api.get('/spin/config')`
- KHÔNG truyền tham số spinType

✅ Model `SpinReward`:
- KHÔNG có field spinType
- Chỉ có: rewardType ('cash', 'account', 'voucher', 'nothing')

## Nếu cần test API trực tiếp

Dùng Postman hoặc browser:
```
GET http://localhost:9003/api/spin/config
Headers:
  Authorization: Bearer <your_token>
```

Kết quả mong đợi: Array các reward objects
