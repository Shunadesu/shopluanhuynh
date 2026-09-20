import express from 'express';
import { getBot, getWebhookSecretToken } from '../services/telegramBot.js';

const router = express.Router();

/**
 * Telegram Webhook endpoint
 * Telegram sẽ POST updates đến đây khi có tin nhắn/callback mới
 */
router.post('/webhook', async (req, res) => {
  try {
    // Validate secret token từ header
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];
    const expectedToken = getWebhookSecretToken();

    if (!expectedToken) {
      console.error('❌ TELEGRAM_WEBHOOK_SECRET not configured in .env');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (secretToken !== expectedToken) {
      console.warn('⚠️  Invalid webhook secret token from:', req.ip);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Lấy bot instance
    const bot = getBot();
    if (!bot) {
      console.error('❌ Bot not initialized');
      return res.status(503).json({ error: 'Bot not ready' });
    }

    // Lấy update từ request body
    const update = req.body;

    if (!update) {
      return res.status(400).json({ error: 'No update provided' });
    }

    // Log webhook received (không log toàn bộ update để tránh spam logs)
    console.log(`📨 Webhook received: update_id=${update.update_id}, type=${
      update.message ? 'message' : 
      update.callback_query ? 'callback_query' : 
      'other'
    }`);

    // Xử lý update bất đồng bộ để trả về 200 nhanh
    // Telegram yêu cầu response trong 60 giây
    setImmediate(async () => {
      try {
        await bot.handleUpdate(update);
      } catch (error) {
        console.error('❌ Error handling Telegram update:', error);
      }
    });

    // Trả về 200 OK ngay lập tức
    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('❌ Webhook endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint để kiểm tra webhook có hoạt động không
 */
router.get('/health', (req, res) => {
  const bot = getBot();
  res.json({ 
    status: bot ? 'ready' : 'not_initialized',
    timestamp: new Date().toISOString()
  });
});

export default router;
