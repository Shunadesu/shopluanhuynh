# Hướng dẫn tính năng Nạp tiền bằng thẻ cào

## Tổng quan
Đã hoàn thành tích hợp tính năng nạp tiền bằng thẻ cào điện thoại vào hệ thống.

## Các thay đổi đã thực hiện

### 1. Backend

#### Model: `DepositRequest.js`
- ✅ Đã có sẵn field `depositMethod` ('bank' | 'card')
- ✅ Đã có sẵn fields cho card: `cardType`, `cardSerial`, `cardCode`
- ✅ Validation: `bankAccountId` chỉ bắt buộc khi `depositMethod === 'bank'`

#### Routes: `deposits.js`
- ✅ **Endpoint mới:** `POST /api/deposits/card-request`
  - Nhận: `{ amount, cardType, cardSerial, cardCode }`
  - Validate: loại thẻ, độ dài serial/code, duplicate trong 24h
  - **KHÔNG gửi Telegram notification** (theo yêu cầu)
  - Trả về: deposit object với status 'pending'

- ✅ **Endpoint cũ vẫn hoạt động:**
  - `POST /api/deposits/request` - nạp bank (có Telegram)
  - `GET /api/deposits/my-requests` - lấy lịch sử (cả bank + card)
  - `DELETE /api/deposits/:id` - hủy request pending

### 2. Frontend

#### Store: `depositStore.js`
- ✅ Thêm function `createCardDeposit()`
- ✅ Tự động thêm vào `myRequests` sau khi tạo thành công

#### Component mới: `CardDepositPanel.jsx`
**Giao diện:**
- Form chọn loại thẻ: Viettel (đỏ), Mobifone (xanh), Vinaphone (tím)
- Chọn mệnh giá: 10K → 500K (grid 4 cột)
- Input số serial (min 8 ký tự)
- Input mã thẻ (min 8 ký tự)
- Warning notice: lưu ý quan trọng
- Summary box: hiển thị loại thẻ + mệnh giá đã chọn

**Validation:**
- Client-side: check trống, độ dài tối thiểu
- Server-side: check duplicate trong 24h

#### Page mới: `CardDeposit.jsx`
- Layout: AccountSidebar + CardDepositPanel
- Route: `/deposit/card` (protected)

#### Cập nhật: `App.jsx`
- ✅ Import CardDeposit page
- ✅ Đã có route `/deposit/card` với ProtectedRoute

#### Cập nhật: `AccountSidebar.jsx`
- ✅ Menu "Nạp bằng thẻ cào" **đã được enable**
- ✅ Icon FiPhone, highlight border dashed
- ✅ Active state khi ở route `/deposit/card`

#### Cập nhật: `Profile.jsx` - DepositsSection
**Hiển thị trong lịch sử:**
- Badge phương thức:
  - Bank: blue badge "Ngân hàng" + icon FiCreditCard
  - Card: purple badge "Thẻ cào" + icon FiPhone
- Cột thông tin:
  - Bank: hiển thị tên ngân hàng + số tài khoản
  - Card: hiển thị loại thẻ (màu tương ứng) + serial (masked)

### 3. Admin Panel

#### Page: `Deposits.jsx`
**Đã hỗ trợ đầy đủ:**
- ✅ Badge phương thức (bank/card)
- ✅ Hiển thị thông tin card: loại thẻ (màu), serial (masked)
- ✅ Modal chi tiết: serial + code đầy đủ để admin check
- ✅ Approve/Reject: API giữ nguyên (`/admin/deposits/:id/approve`)

## Flow hoạt động

### Nạp thẻ cào (Card Deposit)
```
User → Chọn loại thẻ → Chọn mệnh giá → Nhập serial/code
     → Submit form
     → POST /api/deposits/card-request
     → DepositRequest created (status: pending, depositMethod: card)
     → KHÔNG gửi Telegram
     → Admin vào trang Deposits
     → Xem chi tiết → Check thẻ thủ công
     → Approve: cộng tiền vào user.balance
     → Reject: từ chối với ghi chú
```

### Nạp ngân hàng (Bank Deposit) - vẫn như cũ
```
User → Chọn ngân hàng → Nhập số tiền → QR code
     → POST /api/deposits/request
     → DepositRequest created (status: pending, depositMethod: bank)
     → ✅ Gửi Telegram notification
     → Admin nhận thông báo qua bot
     → Approve/Reject qua Telegram hoặc Web
```

## Mệnh giá thẻ cào hỗ trợ
- 10,000đ
- 20,000đ
- 30,000đ
- 50,000đ
- 100,000đ
- 200,000đ
- 300,000đ
- 500,000đ

## Loại thẻ hỗ trợ
1. **Viettel** (màu đỏ)
2. **Mobifone** (màu xanh)
3. **Vinaphone** (màu tím)

## Validation rules

### Client
- `amount`: bắt buộc, >= 10,000
- `cardType`: bắt buộc, trong ['viettel', 'mobifone', 'vinaphone']
- `cardSerial`: bắt buộc, >= 8 ký tự
- `cardCode`: bắt buộc, >= 8 ký tự

### Server
- Tất cả validation của client +
- Check duplicate (serial + code) trong 24h

## Điểm khác biệt: Bank vs Card

| Tính năng | Bank Deposit | Card Deposit |
|-----------|--------------|--------------|
| Telegram Bot | ✅ Có | ❌ Không |
| QR Code | ✅ Có | ❌ Không |
| Countdown timer | ✅ 5 phút | ❌ Không |
| Admin check | Tự động qua bot | ✅ Thủ công 100% |
| Rate limit | ✅ Có | ❌ Không (yêu cầu) |
| Transfer note | ✅ Có | ❌ Không |

## Test checklist

### User Flow
- [ ] Vào `/deposit/card` thấy form đầy đủ
- [ ] Chọn loại thẻ → UI highlight đúng
- [ ] Chọn mệnh giá → summary box cập nhật
- [ ] Nhập serial/code → validation hoạt động
- [ ] Submit → hiển thị toast success
- [ ] Vào Profile → Deposits → thấy request mới với badge "Thẻ cào"

### Admin Flow
- [ ] Admin vào trang Deposits → thấy request card
- [ ] Click "Xem chi tiết" → thấy serial + code đầy đủ
- [ ] Approve → user nhận tiền, status = approved
- [ ] Check user balance tăng đúng mệnh giá

### Security
- [ ] Không gửi Telegram cho card deposits
- [ ] Không thể submit serial/code trùng trong 24h
- [ ] Protected route: chỉ user đăng nhập mới nạp được

## Files đã thay đổi/tạo mới

### Backend (Server)
- ✅ `server/models/DepositRequest.js` - đã có sẵn đầy đủ
- ✅ `server/routes/deposits.js` - đã có endpoint `/card-request`

### Frontend
- ✅ `frontend/src/components/CardDepositPanel.jsx` - **MỚI**
- ✅ `frontend/src/pages/CardDeposit.jsx` - **MỚI**
- ✅ `frontend/src/store/data/depositStore.js` - thêm `createCardDeposit`
- ✅ `frontend/src/App.jsx` - thêm route `/deposit/card`
- ✅ `frontend/src/components/AccountSidebar.jsx` - enable menu
- ✅ `frontend/src/pages/Profile.jsx` - hiển thị card deposits

### Admin
- ✅ `admin/src/pages/Deposits.jsx` - đã hỗ trợ card deposits

## Lưu ý triển khai

1. **Không cần chạy migration DB** - Model đã có sẵn fields
2. **Server đang chạy** - Port 9003 đã active
3. **Frontend build OK** - Không có lỗi
4. **Telegram Bot** - Chỉ gửi cho bank deposits, card deposits không gửi

## Next steps (tùy chọn)

- [ ] Thêm API tích hợp check thẻ tự động (nếu có đối tác)
- [ ] Thêm chiết khấu mệnh giá (VD: 100K thẻ = 95K balance)
- [ ] Thêm limit số lần nạp thẻ/ngày cho mỗi user
- [ ] Thêm notification cho user khi admin approve/reject

---

**Status:** ✅ HOÀN THÀNH - Sẵn sàng deploy
**Date:** 12/09/2026
