import { Bot } from 'node-telegram-bot-api';
import crypto from 'crypto';

import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';
import { calculateSpinsAwarded } from '../utils/spinLogic.js';

let bot = null;
let adminChatId = null;
let webhookSecretToken = null;

/**
 * Lấy bot instance (dùng cho webhook route)
 */
export function getBot() {
  return bot;
}

/**
 * Lấy webhook secret token (dùng cho webhook route)
 */
export function getWebhookSecretToken() {
  return webhookSecretToken;
}

/**
 * Khởi tạo Telegram bot với webhook mode
 */
export async function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;
  
  // Generate hoặc lấy webhook secret token
  webhookSecretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecretToken) {
    webhookSecretToken = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  TELEGRAM_WEBHOOK_SECRET not set. Generated random token (will not persist after restart):');
    console.warn(`   ${webhookSecretToken}`);
  }

  if (!token || !adminChatId) {
    console.warn('⚠️  Telegram bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in .env');
    return;
  }

  if (!webhookBaseUrl) {
    console.warn('⚠️  WEBHOOK_BASE_URL not set. Falling back to polling mode.');
    await initPollingMode(token);
    return;
  }

  try {
    bot = new Bot(token);
    
    // Handle /start command
    bot.command('start', async (ctx) => {
      const chatId = ctx.chat.id;
      const username = ctx.from?.username || ctx.from?.first_name || 'User';
      
      const welcomeMessage = `
👋 Xin chào <b>${username}</b>!

🤖 Đây là bot thông báo nạp tiền của <b>Shop Luân Huỳnh</b>

${chatId.toString() === adminChatId ? '✅ Bạn là Admin - Bạn sẽ nhận được thông báo khi có yêu cầu nạp tiền mới!' : '⚠️ Bot này chỉ dành cho Admin.'}

📌 <b>Chat ID của bạn:</b> <code>${chatId}</code>

${chatId.toString() !== adminChatId ? '\n💡 Nếu bạn là Admin, hãy cập nhật TELEGRAM_ADMIN_CHAT_ID trong file .env với Chat ID trên.' : ''}
      `.trim();

      await ctx.reply(welcomeMessage, { parse_mode: 'HTML' });
      
      console.log(`📱 User ${username} (${chatId}) started bot`);
    });
    
    // Handle callback queries from inline buttons
    bot.on('callback_query', handleCallbackQuery);

    // Error handler
    bot.catch((err) => {
      console.error('❌ Telegram bot error:', err);
    });

    // Setup webhook
    const webhookUrl = `${webhookBaseUrl}/api/telegram/webhook`;
    
    try {
      // Lấy webhook info hiện tại
      const currentWebhook = await bot.api.getWebhookInfo();
      
      if (currentWebhook.url !== webhookUrl) {
        // Set webhook mới
        await bot.api.setWebhook({
          url: webhookUrl,
          secret_token: webhookSecretToken,
          drop_pending_updates: true,
          allowed_updates: ['message', 'callback_query']
        });
        console.log(`✅ Webhook set to: ${webhookUrl}`);
      } else {
        console.log(`✅ Webhook already set to: ${webhookUrl}`);
      }
    } catch (webhookError) {
      console.error('❌ Failed to set webhook:', webhookError.message);
      console.warn('⚠️  Falling back to polling mode');
      await initPollingMode(token);
      return;
    }
    
    console.log('✅ Telegram bot initialized in WEBHOOK mode');
    console.log(`📍 Webhook URL: ${webhookUrl}`);
    console.log(`🔐 Secret token: ${webhookSecretToken.substring(0, 8)}...`);
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
  }
}

/**
 * Fallback: Khởi tạo bot với polling mode (khi không có webhook URL)
 */
async function initPollingMode(token) {
  try {
    if (!bot) {
      bot = new Bot(token);
      
      // Handle /start command
      bot.command('start', async (ctx) => {
        const chatId = ctx.chat.id;
        const username = ctx.from?.username || ctx.from?.first_name || 'User';
        
        const welcomeMessage = `
👋 Xin chào <b>${username}</b>!

🤖 Đây là bot thông báo nạp tiền của <b>Shop Luân Huỳnh</b>

${chatId.toString() === adminChatId ? '✅ Bạn là Admin - Bạn sẽ nhận được thông báo khi có yêu cầu nạp tiền mới!' : '⚠️ Bot này chỉ dành cho Admin.'}

📌 <b>Chat ID của bạn:</b> <code>${chatId}</code>

${chatId.toString() !== adminChatId ? '\n💡 Nếu bạn là Admin, hãy cập nhật TELEGRAM_ADMIN_CHAT_ID trong file .env với Chat ID trên.' : ''}
        `.trim();

        await ctx.reply(welcomeMessage, { parse_mode: 'HTML' });
        
        console.log(`📱 User ${username} (${chatId}) started bot`);
      });
      
      // Handle callback queries from inline buttons
      bot.on('callback_query', handleCallbackQuery);

      // Error handler
      bot.catch((err) => {
        console.error('❌ Telegram bot error:', err);
      });
    }

    // Delete webhook trước khi start polling
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    console.log('🗑️  Webhook deleted');

    // Start polling
    bot.startPolling();
    
    console.log('✅ Telegram bot initialized in POLLING mode (fallback)');
  } catch (error) {
    console.error('❌ Failed to initialize polling mode:', error.message);
  }
}

/**
 * Gửi thông báo deposit mới đến admin
 */
export async function sendDepositNotification(deposit) {
  if (!bot || !adminChatId) {
    return; // Bot not configured, skip silently
  }

  try {
    // Populate user and bank data
    const depositData = await DepositRequest.findById(deposit._id)
      .populate('userId', 'username fullName email phone')
      .populate('bankAccountId', 'bankName accountName accountNumber');

    if (!depositData) {
      console.error('Deposit not found:', deposit._id);
      return;
    }

    const user = depositData.userId;
    const bank = depositData.bankAccountId;

    // Format message
    const message = `
🔔 <b>YÊU CẦU NẠP TIỀN MỚI</b>

━━━━━━━━━━━━━━━━━━
📌 <b>Mã GD:</b> <code>#${depositData._id.toString().slice(-8).toUpperCase()}</code>

👤 <b>Người dùng:</b>
   • Username: <b>${user?.username || 'N/A'}</b>
   • Họ tên: ${user?.fullName || 'N/A'}


💰 <b>Số tiền:</b> <b>${depositData.amount.toLocaleString('vi-VN')}đ</b>

🏦 <b>Ngân hàng nhận:</b>
   • ${bank?.bankName || 'N/A'}
   • ${bank?.accountName || 'N/A'}
   • STK: <code>${bank?.accountNumber || 'N/A'}</code>

📝 <b>Nội dung CK:</b> <code>${depositData.transferNote || 'N/A'}</code>

⏰ <b>Thời gian:</b> ${new Date(depositData.createdAt).toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}
━━━━━━━━━━━━━━━━━━
    `.trim();

    // Inline keyboard with approve/reject buttons
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Xác nhận',
            callback_data: `approve_${depositData._id}`
          },
          {
            text: '❌ Từ chối',
            callback_data: `reject_${depositData._id}`
          }
        ]
      ]
    };

    await bot.api.sendMessage({
      chat_id: adminChatId,
      text: message,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });

    console.log('✅ Telegram notification sent for deposit:', depositData._id);
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.message);
  }
}

/**
 * Xử lý callback query từ inline buttons
 */
async function handleCallbackQuery(ctx) {
  const chatId = ctx.chat.id;
  const messageId = ctx.callbackQuery.message.message_id;
  const callbackData = ctx.callbackQuery.data;

  // Verify it's from admin chat
  if (chatId.toString() !== adminChatId) {
    await ctx.answerCallbackQuery({
      text: '❌ Unauthorized',
      show_alert: true
    });
    return;
  }

  try {
    // Parse callback data: "approve_depositId" or "reject_depositId"
    const [action, depositId] = callbackData.split('_');

    if (!['approve', 'reject'].includes(action) || !depositId) {
      await ctx.answerCallbackQuery({
        text: '❌ Invalid action',
        show_alert: true
      });
      return;
    }

    // Find deposit
    const deposit = await DepositRequest.findById(depositId)
      .populate('userId', 'username balance');

    if (!deposit) {
      await ctx.answerCallbackQuery({
        text: '❌ Không tìm thấy yêu cầu nạp tiền',
        show_alert: true
      });
      return;
    }

    // Check if already processed
    if (deposit.status !== 'pending') {
      await ctx.answerCallbackQuery({
        text: `⚠️ Yêu cầu này đã được xử lý (${deposit.status})`,
        show_alert: true
      });
      return;
    }

    // Process deposit
    if (action === 'approve') {
      // Approve and add balance to user
      deposit.status = 'approved';
      deposit.processedAt = new Date();
      
      const user = await User.findById(deposit.userId);
      let spinsAwarded = 0;
      
      if (user) {
        // Award spins based on cumulative deposit (mỗi 200k = 1 lượt, cộng dồn)
        const prevTotalDeposited = user.totalDeposited || 0;
        const newTotalDeposited = prevTotalDeposited + deposit.amount;
        spinsAwarded = calculateSpinsAwarded(prevTotalDeposited, newTotalDeposited);
        
        // Update user (same way as admin panel)
        user.balance += deposit.amount;
        user.totalDeposited = newTotalDeposited;
        user.spins = (user.spins || 0) + spinsAwarded;
        await user.save();
        
        console.log(`✅ Deposit ${depositId} approved via Telegram - User received ${spinsAwarded} spins (balance: ${user.balance}, totalDeposited: ${user.totalDeposited}, spins: ${user.spins})`);
      }

      await deposit.save();

      // Update message with spin info
      const updatedMessage = ctx.callbackQuery.message.text + `\n\n✅ <b>ĐÃ DUYỆT</b>\n⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n👤 Xử lý từ Telegram${spinsAwarded > 0 ? `\n🎡 Nhận thêm: <b>${spinsAwarded} lượt quay</b>` : ''}`;
      
      await bot.api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: updatedMessage,
        parse_mode: 'HTML'
      });

      await ctx.answerCallbackQuery({
        text: '✅ Đã duyệt yêu cầu nạp tiền'
      });

    } else if (action === 'reject') {
      // Reject deposit
      deposit.status = 'rejected';
      deposit.processedAt = new Date();
      deposit.adminNote = 'Từ chối từ Telegram';
      await deposit.save();

      // Update message
      const updatedMessage = ctx.callbackQuery.message.text + `\n\n❌ <b>ĐÃ TỪ CHỐI</b>\n⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n👤 Xử lý từ Telegram`;
      
      await bot.api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: updatedMessage,
        parse_mode: 'HTML'
      });

      await ctx.answerCallbackQuery({
        text: '❌ Đã từ chối yêu cầu nạp tiền'
      });

      console.log(`❌ Deposit ${depositId} rejected via Telegram`);
    }

  } catch (error) {
    console.error('❌ Error handling callback query:', error);
    await ctx.answerCallbackQuery({
      text: `❌ Lỗi: ${error.message}`,
      show_alert: true
    });
  }
}

export default bot;
