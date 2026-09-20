# Quick Start - Deploy Telegram Webhook

## Bước 1: Generate Secret Token

```bash
cd server
node scripts/generateWebhookSecret.js
```

Copy token đã generate.

## Bước 2: Cập nhật .env trên server

SSH vào server và edit file `.env`:

```bash
ssh user@luanhuynhfc.shop
cd /www/wwwroot/be_shopluanhuynh
nano .env
```

Thêm 2 dòng này:

```env
WEBHOOK_BASE_URL=https://luanhuynhfc.shop
TELEGRAM_WEBHOOK_SECRET=<paste_token_từ_bước_1>
```

Lưu file (Ctrl+O, Enter, Ctrl+X).

## Bước 3: Restart Server

```bash
# Nếu dùng PM2
pm2 restart backend

# Hoặc nếu dùng npm
npm restart
```

## Bước 4: Kiểm tra

```bash
# Check logs
pm2 logs backend --lines 50

# Hoặc
tail -f /path/to/logs/app.log
```

Phải thấy:
```
✅ Webhook set to: https://luanhuynhfc.shop/api/telegram/webhook
✅ Telegram bot initialized in WEBHOOK mode
```

## Bước 5: Verify Webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Kết quả phải có:
- `"url": "https://luanhuynhfc.shop/api/telegram/webhook"`
- `"pending_update_count": 0`

## Test

Gửi tin nhắn `/start` cho bot trên Telegram. Bot phải reply ngay lập tức.

## Rollback (nếu có vấn đề)

Xóa 2 dòng `WEBHOOK_BASE_URL` và `TELEGRAM_WEBHOOK_SECRET` trong `.env`, sau đó restart. Bot sẽ tự động chuyển về polling mode.

---

**Chi tiết đầy đủ:** Xem file `TELEGRAM_WEBHOOK_SETUP.md`
