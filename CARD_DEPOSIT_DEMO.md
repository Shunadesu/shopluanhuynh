# Demo Flow - Nạp tiền bằng thẻ cào

## 1. User vào menu "Nạp bằng thẻ cào"
**Vị trí:** Account Sidebar
- Menu item với icon FiPhone
- Border dashed highlight màu primary
- Không bị disabled

**Screenshot sẽ thấy:**
- Sidebar có menu "Nạp bằng thẻ cào" active
- Icon điện thoại màu highlight

---

## 2. Form nạp thẻ cào hiển thị
**URL:** `/deposit/card`

**Header Card:**
- Icon FiPhone trong background purple/20
- Tiêu đề: "Nạp tiền bằng thẻ cào"
- Mô tả: hướng dẫn ngắn

**Warning Box (màu cam):**
- Icon FiAlertCircle
- 5 lưu ý quan trọng dạng bullet list
- Background: orange/10, border: orange/30

**Form chính:**

### Bước 1: Chọn loại thẻ (3 buttons)
```
[Viettel]    [Mobifone]    [Vinaphone]
  (đỏ)         (xanh)         (tím)
```
- Mỗi button: icon FiPhone + tên nhà mạng
- Active: full color background + white text + checkmark
- Inactive: border outline + hover effect

### Bước 2: Chọn mệnh giá (grid 4x2)
```
[10K]  [20K]  [30K]  [50K]
[100K] [200K] [300K] [500K]
```
- Active: border primary + background primary/10
- Inactive: border slate + hover

### Bước 3: Nhập số serial
- Icon FiHash bên trái
- Input font-mono
- Helper text: "Số serial thường nằm phía dưới mã thẻ..."

### Bước 4: Nhập mã thẻ
- Icon FiKey bên trái
- Input font-mono
- Helper text: "Mã thẻ nằm ở mặt sau thẻ cào..."

### Summary Box (khi đã chọn):
```
┌─────────────────────────────┐
│ Loại thẻ:  Viettel (đỏ)    │
│ Mệnh giá:  100,000đ (bold)  │
└─────────────────────────────┘
```
- Background: slate-100 dark:slate-800/50
- Màu text loại thẻ theo nhà mạng

### Submit Button:
- Full width
- Icon FiDollarSign + "Gửi yêu cầu nạp thẻ"
- Loading state: spinner + "Đang xử lý..."

**Help Link:**
- Text: "Bạn gặp vấn đề khi nạp thẻ?"
- Link: "Xem hướng dẫn nạp thẻ cào →"

---

## 3. User submit thành công
**Toast notification:**
```
✓ Đã gửi yêu cầu nạp thẻ cào! 
  Admin sẽ kiểm tra và xác nhận.
```

**Form reset về trạng thái ban đầu:**
- Tất cả fields clear
- Không auto redirect (user có thể nạp tiếp)

---

## 4. User vào Profile → Lịch sử nạp tiền
**URL:** `/profile?view=deposits`

**Table hiển thị:**
```
STT | Ngày | Số tiền | Phương thức | Thông tin | Trạng thái
----|------|---------|-------------|-----------|------------
1   | ...  | +100K   | [Thẻ cào]  | Viettel   | Chờ duyệt
                       (purple)     12345***
```

**Chi tiết cột:**
- **Phương thức:**
  - Bank: blue badge + FiCreditCard
  - Card: purple badge + FiPhone
  
- **Thông tin:**
  - Bank: Tên ngân hàng + Số TK
  - Card: Loại thẻ (màu) + Serial masked (8 ký tự đầu + ***)

- **Trạng thái:**
  - pending: vàng "Chờ duyệt"
  - approved: xanh "Đã duyệt"
  - rejected: đỏ "Từ chối"

---

## 5. Admin vào trang Deposits
**URL:** `admin.example.com/deposits`

**Filter bar:**
- Search box
- Dropdown: "Tất cả trạng thái"
- Button refresh

**Table columns:**
```
Mã GD | Người dùng | Phương thức | Số tiền | Thông tin | Trạng thái | Thời gian | Thao tác
```

**Row example (Card):**
- Mã GD: `#ABC12345` (cyan, font-mono)
- Người dùng: username + email
- Phương thức: Purple badge "Thẻ cào"
- Số tiền: `100,000đ` (cyan, bold)
- Thông tin:
  ```
  Viettel (màu đỏ)
  S: 12345678... (font-mono, slate-400)
  ```
- Trạng thái: Badge pending
- Thao tác: [👁️] [✓] [✕]

---

## 6. Admin click "Xem chi tiết"
**Modal hiển thị:**

### Header:
"Chi tiết yêu cầu nạp tiền"

### Section 1: Tổng quan
```
Mã GD:      #ABC12345 (cyan)
Trạng thái: [Chờ duyệt] (badge)
```

### Section 2: Thông tin người dùng
```
Tên:   Nguyễn Văn A
Email: user@example.com
SĐT:   0909123456
```

### Section 3: Thông tin giao dịch
```
Số tiền:      100,000đ (cyan, bold)
Phương thức:  [Thẻ cào] (purple badge)
Loại thẻ:     Viettel (đỏ, bold)
Số serial:    1234567890123 (font-mono, full)
Mã thẻ:       9876543210987 (font-mono, full)
```

### Section 4: Thời gian
```
Tạo lúc:     12/09/2026 04:15:30
Xử lý lúc:   - (nếu pending)
Người xử lý: - (nếu pending)
```

### Section 5: Ghi chú admin
```
[Textarea disabled nếu đã xử lý]
hoặc
[Textarea enabled để nhập ghi chú]
```

### Buttons:
- Nếu pending:
  - [Duyệt] (green) + [Từ chối] (red) + [Đóng] (slate)
- Nếu đã xử lý:
  - [Đóng] (primary)

---

## 7. Admin approve
**Action:**
1. Admin copy serial + code
2. Vào trang web check thẻ của nhà mạng (external)
3. Nếu OK → Click "Duyệt" trong modal
4. Confirm: "Xác nhận duyệt yêu cầu?"

**API call:**
```
PUT /api/admin/deposits/{id}/approve
→ User.balance += deposit.amount
→ DepositRequest.status = 'approved'
→ DepositRequest.processedBy = admin._id
→ DepositRequest.processedAt = now
```

**Result:**
- Toast: "Cập nhật trạng thái thành công"
- Modal đóng
- Table reload → status badge = "Đã duyệt" (xanh)
- User balance tăng

---

## 8. User refresh Profile
**Deposit row cập nhật:**
- Trạng thái: "Đã duyệt" (xanh)
- Balance ở header tăng +100,000đ

---

## So sánh: Bank vs Card UI

### Bank Deposit (cũ):
```
- QR Code hiển thị
- Countdown timer 5 phút
- Transfer note: NAP123456789
- Auto refresh status
- Telegram notification cho admin
```

### Card Deposit (mới):
```
- KHÔNG có QR Code
- KHÔNG có countdown
- KHÔNG có transfer note
- KHÔNG auto refresh (user tự check)
- KHÔNG có Telegram notification
- Form đơn giản: chọn thẻ + nhập code
```

---

## Responsive Design

### Desktop (≥1024px):
- Sidebar bên trái cố định
- Form content bên phải, max-w-2xl centered
- Grid 4 cột cho mệnh giá

### Tablet (768-1023px):
- Sidebar collapse thành mobile nav
- Form full width với padding
- Grid 4 cột cho mệnh giá (giữ nguyên)

### Mobile (<768px):
- Bottom nav thay sidebar
- Form full width
- Grid 4 cột cho mệnh giá (responsive text)
- Buttons stack vertical khi cần

---

## Dark Mode Support
Toàn bộ UI hỗ trợ dark mode:
- Background: dark-light, dark-lighter
- Text: slate-100, slate-300, slate-400
- Borders: slate-700, slate-800
- Accents giữ nguyên: red-500, blue-500, purple-500, primary

---

**Status:** ✅ Full UI/UX hoàn chỉnh
