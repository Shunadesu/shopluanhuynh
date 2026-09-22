# Telegram Bot Webhook Setup

## Tổng quan

Bot Telegram đã được cấu hình để hoạt động ở 2 chế độ:
- **Webhook mode** (Production - khuyến nghị): Telegram push tin nhắn về server qua HTTPS
- **Polling mode** (Fallback): Bot liên tục hỏi Telegram có tin nhắn mới không

## Cấu hình Webhook (Production)

### 1. Generate Secret Token

Chạy lệnh sau để tạo random secret token:

```bash
cd server
node scripts/generateWebhookSecret.js
```

### 2. Cập nhật .env

Thêm các biến sau vào file `.env`:

```env
# HTTPS base URL của backend (không có dấu / ở cuối)
WEBHOOK_BASE_URL=https://luanhuynhfc.shop

# Secret token vừa generate ở bước 1
TELEGRAM_WEBHOOK_SECRET=your_64_char_hex_string_here
```

### 3. Restart Server

```bash
npm start
```

Khi khởi động thành công, bạn sẽ thấy log:

```
✅ Telegram bot initialized in WEBHOOK mode
📍 Webhook URL: https://luanhuynhfc.shop/api/telegram/webhook
🔐 Secret token: abc12345...
```

### 4. Kiểm tra Webhook Status

Gọi API Telegram để kiểm tra webhook đã được set chưa:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Kết quả mong muốn:

```json
{
  "ok": true,
  "result": {
    "url": "https://luanhuynhfc.shop/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

Nếu có lỗi, check `last_error_date` và `last_error_message`.

## Cấu hình Nginx/Reverse Proxy

Đảm bảo Nginx forward request đến Node.js backend:

```nginx
location /api/telegram/webhook {
    proxy_pass http://localhost:9003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Polling Mode (Fallback)

Nếu không có `WEBHOOK_BASE_URL` trong `.env`, bot tự động chuyển sang polling mode.

**Lưu ý:** Polling không khuyến nghị cho production vì:
- Tốn tài nguyên server (request liên tục)
- Độ trễ cao hơn webhook
- Không scale tốt

## Troubleshooting

### Lỗi: 409 Conflict (can't use getUpdates while webhook is active)

**Nguyên nhân:** Bot đang cố polling nhưng webhook vẫn còn active.

**Giải pháp:** Xóa webhook trước:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook?drop_pending_updates=true"
```

### Lỗi: Webhook không nhận được request

**Kiểm tra:**

1. HTTPS có hoạt động không?
   ```bash
   curl https://luanhuynhfc.shop/api/telegram/health
   ```

2. Nginx có forward đúng không?
   ```bash
   # Check Nginx logs
   tail -f /var/log/nginx/access.log
   ```

3. Node.js có chạy không?
   ```bash
   pm2 status
   pm2 logs
   ```

### Lỗi: 403 Forbidden từ webhook endpoint

**Nguyên nhân:** Secret token không khớp.

**Giải pháp:** Đảm bảo `TELEGRAM_WEBHOOK_SECRET` trong `.env` giống với token đã set webhook.

## Security Best Practices

1. ✅ **Luôn dùng HTTPS** - Telegram yêu cầu bắt buộc
2. ✅ **Set secret token** - Ngăn requests giả mạo
3. ✅ **Validate header** - Route đã tự động check `X-Telegram-Bot-Api-Secret-Token`
4. ✅ **Rate limiting** - Cân nhắc thêm rate limit cho endpoint
5. ✅ **Logging** - Monitor webhook requests để phát hiện bất thường

## Testing

### Test webhook endpoint locally

```bash
# Health check
curl http://localhost:9003/api/telegram/health

# Mock webhook request (sẽ bị reject vì không có secret token)
curl -X POST http://localhost:9003/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id": 123}'
```

### Test với ngrok (development)

Nếu muốn test webhook trên máy local:

```bash
# 1. Cài ngrok: https://ngrok.com/
# 2. Start server local
npm start

# 3. Expose local server qua HTTPS
ngrok http 9003

# 4. Update .env với ngrok URL
WEBHOOK_BASE_URL=https://abc123.ngrok.io

# 5. Restart server để set webhook
```

## API Endpoints

### POST /api/telegram/webhook

Nhận updates từ Telegram.

**Headers:**
- `X-Telegram-Bot-Api-Secret-Token`: Secret token để validate

**Body:** Telegram Update object

**Response:**
- `200 OK`: Update đã nhận
- `403 Forbidden`: Invalid secret token
- `503 Service Unavailable`: Bot chưa khởi tạo

### GET /api/telegram/health

Health check endpoint.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2026-09-20T01:00:00.000Z"
}
```

## Logs

Bot sẽ log các sự kiện quan trọng:

- ✅ Webhook set thành công
- 📨 Webhook received (với update_id và type)
- ❌ Errors khi xử lý update
- ⚠️ Invalid secret token attempts

Check logs:
```bash
pm2 logs backend
# hoặc
tail -f /path/to/server/logs/app.log
```
