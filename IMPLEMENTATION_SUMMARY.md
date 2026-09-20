# 📋 Tóm tắt: Telegram Bot Webhook Implementation

## ✅ Đã hoàn thành

### 1. File mới được tạo

- ✅ **`server/routes/telegram.js`** - Webhook endpoint handler
  - POST `/api/telegram/webhook` - Nhận updates từ Telegram
  - GET `/api/telegram/health` - Health check
  - Validate secret token từ header `X-Telegram-Bot-Api-Secret-Token`

- ✅ **`server/scripts/generateWebhookSecret.js`** - Script tạo random secret token
  
- ✅ **`server/TELEGRAM_WEBHOOK_SETUP.md`** - Hướng dẫn chi tiết đầy đủ

- ✅ **`server/DEPLOY_WEBHOOK.md`** - Quick start guide 5 bước

### 2. File đã chỉnh sửa

- ✅ **`server/services/telegramBot.js`**
  - Thêm `getBot()` và `getWebhookSecretToken()` exports
  - Đổi logic khởi tạo: ưu tiên webhook mode, fallback sang polling
  - Thêm function `initPollingMode()` cho fallback
  - Import `crypto` để generate random token

- ✅ **`server/server.js`**
  - Import `telegramRoutes`
  - Mount route: `app.use('/api/telegram', telegramRoutes)`

- ✅ **`server/.env.example`**
  - Thêm `WEBHOOK_BASE_URL`
  - Thêm `TELEGRAM_WEBHOOK_SECRET`
  - Thêm comments hướng dẫn

## 🔄 Cách hoạt động

### Webhook Mode (Production)

```
Telegram API
    ↓ (HTTPS POST)
https://luanhuynhfc.shop/api/telegram/webhook
    ↓ (validate secret token)
Express route handler
    ↓
bot.handleUpdate(update)
    ↓
Command/Callback handlers
```

### Polling Mode (Fallback)

```
Bot → getUpdates() → Telegram API (mỗi vài giây)
```

## 📦 Cấu trúc thay đổi

```
server/
├── routes/
│   └── telegram.js              [MỚI] Webhook endpoint
├── services/
│   └── telegramBot.js           [SỬA] Webhook mode + exports
├── scripts/
│   └── generateWebhookSecret.js [MỚI] Token generator
├── server.js                    [SỬA] Mount telegram route
├── .env.example                 [SỬA] Thêm webhook config
├── TELEGRAM_WEBHOOK_SETUP.md    [MỚI] Hướng dẫn đầy đủ
└── DEPLOY_WEBHOOK.md            [MỚI] Quick start
```

## 🚀 Deploy Instructions

### Trên server production (luanhuynhfc.shop):

1. **Generate secret token** (chạy trên local hoặc server):
   ```bash
   node server/scripts/generateWebhookSecret.js
   ```

2. **Cập nhật .env trên server**:
   ```env
   WEBHOOK_BASE_URL=https://luanhuynhfc.shop
   TELEGRAM_WEBHOOK_SECRET=<token_vừa_generate>
   ```

3. **Upload code lên server** (git pull hoặc FTP):
   ```bash
   git pull origin main
   ```

4. **Restart server**:
   ```bash
   pm2 restart backend
   ```

5. **Verify**:
   ```bash
   pm2 logs backend --lines 50
   ```
   
   Phải thấy:
   ```
   ✅ Webhook set to: https://luanhuynhfc.shop/api/telegram/webhook
   ✅ Telegram bot initialized in WEBHOOK mode
   ```

### Kiểm tra webhook status:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Kết quả mong muốn:
```json
{
  "ok": true,
  "result": {
    "url": "https://luanhuynhfc.shop/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 🔒 Security Features

- ✅ **HTTPS required** - Telegram chỉ gửi webhook đến HTTPS URL
- ✅ **Secret token validation** - Header `X-Telegram-Bot-Api-Secret-Token` phải khớp
- ✅ **Fast response** - Trả về 200 OK ngay, xử lý async sau (Telegram timeout 60s)
- ✅ **Auto-generated token** - Nếu không set trong .env sẽ tự generate (nhưng không persist)

## 🎯 Lợi ích Webhook vs Polling

| Feature | Webhook | Polling |
|---------|---------|---------|
| **Hiệu suất** | ⚡ Cao | 🐌 Thấp |
| **Độ trễ** | < 1s | 2-5s |
| **Tài nguyên** | Ít | Nhiều (request liên tục) |
| **Production** | ✅ Recommended | ❌ Không khuyến nghị |
| **Development** | Cần ngrok | ✅ Dễ setup |

## 🧪 Testing

### Test health endpoint:
```bash
curl https://luanhuynhfc.shop/api/telegram/health
```

### Test bot trên Telegram:
1. Gửi `/start` cho bot
2. Bot phải reply ngay lập tức với welcome message
3. Admin tạo deposit request → Bot gửi notification với inline buttons

## 🔧 Troubleshooting

### Nếu gặp lỗi 409 Conflict:
```bash
# Xóa webhook cũ
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true"
```

### Nếu muốn quay về polling mode:
- Xóa `WEBHOOK_BASE_URL` và `TELEGRAM_WEBHOOK_SECRET` trong `.env`
- Restart server
- Bot tự động fallback sang polling

### Check logs:
```bash
pm2 logs backend --lines 100
# Hoặc
tail -f /www/wwwroot/be_shopluanhuynh/logs/*.log
```

## 📝 Notes

- Code đã hỗ trợ cả 2 mode (webhook + polling fallback)
- Tự động detect môi trường và chọn mode phù hợp
- Không cần modify code khi chuyển giữa dev/prod
- Chỉ cần thay đổi `.env` variables

## ✨ Next Steps (Optional)

- [ ] Setup monitoring cho webhook endpoint
- [ ] Thêm rate limiting cho `/api/telegram/webhook`
- [ ] Log webhook requests vào database để audit
- [ ] Setup alert nếu webhook fail nhiều lần
- [ ] Thêm unit tests cho telegram route

---

**Ready to deploy!** 🚀

Chi tiết: Xem `DEPLOY_WEBHOOK.md` hoặc `TELEGRAM_WEBHOOK_SETUP.md`
