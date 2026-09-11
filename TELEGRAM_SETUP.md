# Hướng Dẫn Cấu Hình Telegram Bot

## Tính năng

Telegram Bot sẽ tự động thông báo khi có lệnh nạp tiền mới với 2 nút:
- ✅ **Xác nhận** - Duyệt lệnh nạp tiền
- ❌ **Từ chối** - Từ chối lệnh nạp tiền

Admin có thể xử lý lệnh nạp tiền trực tiếp từ Telegram mà không cần vào admin panel.

## Cách lấy Bot Token và Chat ID

### 1. Tạo Bot trên Telegram

1. Mở Telegram và tìm **@BotFather**
2. Gửi lệnh `/newbot`
3. Đặt tên cho bot (ví dụ: "ShopLuanHuynh Deposit Bot")
4. Đặt username cho bot (phải kết thúc bằng "bot", ví dụ: "shopluanhuynh_deposit_bot")
5. BotFather sẽ gửi cho bạn **Bot Token** (giữ bí mật)

### 2. Lấy Chat ID của Admin

**Cách 1: Dùng @userinfobot**
1. Tìm và mở **@userinfobot** trên Telegram
2. Gửi tin nhắn bất kỳ
3. Bot sẽ trả về thông tin của bạn, trong đó có **Id** (đó là Chat ID)

**Cách 2: Dùng API Telegram**
1. Gửi tin nhắn cho bot của bạn
2. Truy cập: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Tìm `"from":{"id":123456789}` - đó là Chat ID

### 3. Cấu hình trong file .env

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
```

## Kiểm tra Bot hoạt động

1. Khởi động server: `cd server && npm run dev`
2. Kiểm tra log: Nếu thấy `✅ Telegram bot initialized` là đã thành công
3. Tạo một lệnh nạp tiền test từ frontend
4. Bot sẽ gửi thông báo đến Telegram của admin

## Admin Panel - Badge số lệnh pending

Tại sidebar admin panel (bên trái), mục **Deposits** sẽ hiển thị badge màu đỏ với số lượng lệnh đang chờ xử lý. Badge này tự động cập nhật mỗi 30 giây.

## Cấu trúc thông báo Telegram

```
🔔 Lệnh nạp tiền mới #12345

👤 User: john_doe (John Doe)
💰 Số tiền: 500,000 VND
🏦 Ngân hàng: Vietcombank - 1234567890
📝 Nội dung: NAPTHE12345

⏰ Thời gian: 11/09/2026 20:30
```

## Xử lý lỗi

Nếu bot không hoạt động:
1. Kiểm tra `TELEGRAM_BOT_TOKEN` có đúng không
2. Kiểm tra `TELEGRAM_ADMIN_CHAT_ID` có đúng không
3. Kiểm tra bot đã được start chưa (gửi `/start` cho bot)
4. Kiểm tra server log để xem lỗi cụ thể
