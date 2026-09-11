import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Bot } = require('node-telegram-bot-api');

import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';

let bot = null;
let adminChatId = null;

/**
 * Khởi tạo Telegram bot
 */
export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.warn('⚠️  Telegram bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in .env');
    return;
  }

  try {
    bot = new Bot(token);
    
    // Handle callback queries from inline buttons
    bot.on('callback_query', handleCallbackQuery);

    console.log('✅ Telegram bot initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
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
   • Email: ${user?.email || 'N/A'}
   • SĐT: ${user?.phone || 'N/A'}

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

    await bot.sendMessage(adminChatId, message, {
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
async function handleCallbackQuery(query) {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const callbackData = query.data;

  // Verify it's from admin chat
  if (chatId.toString() !== adminChatId) {
    await bot.answerCallbackQuery(query.id, {
      text: '❌ Unauthorized',
      show_alert: true
    });
    return;
  }

  try {
    // Parse callback data: "approve_depositId" or "reject_depositId"
    const [action, depositId] = callbackData.split('_');

    if (!['approve', 'reject'].includes(action) || !depositId) {
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Invalid action',
        show_alert: true
      });
      return;
    }

    // Find deposit
    const deposit = await DepositRequest.findById(depositId)
      .populate('userId', 'username balance');

    if (!deposit) {
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Không tìm thấy yêu cầu nạp tiền',
        show_alert: true
      });
      return;
    }

    // Check if already processed
    if (deposit.status !== 'pending') {
      await bot.answerCallbackQuery(query.id, {
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
      if (user) {
        user.balance += deposit.amount;
        await user.save();
      }

      await deposit.save();

      // Update message
      const updatedMessage = query.message.text + `\n\n✅ <b>ĐÃ DUYỆT</b>\n⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n👤 Xử lý từ Telegram`;
      
      await bot.editMessageText(updatedMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      });

      await bot.answerCallbackQuery(query.id, {
        text: '✅ Đã duyệt yêu cầu nạp tiền',
        show_alert: false
      });

      console.log(`✅ Deposit ${depositId} approved via Telegram`);

    } else if (action === 'reject') {
      // Reject deposit
      deposit.status = 'rejected';
      deposit.processedAt = new Date();
      deposit.adminNote = 'Từ chối từ Telegram';
      await deposit.save();

      // Update message
      const updatedMessage = query.message.text + `\n\n❌ <b>ĐÃ TỪ CHỐI</b>\n⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n👤 Xử lý từ Telegram`;
      
      await bot.editMessageText(updatedMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      });

      await bot.answerCallbackQuery(query.id, {
        text: '❌ Đã từ chối yêu cầu nạp tiền',
        show_alert: false
      });

      console.log(`❌ Deposit ${depositId} rejected via Telegram`);
    }

  } catch (error) {
    console.error('❌ Error handling callback query:', error);
    await bot.answerCallbackQuery(query.id, {
      text: `❌ Lỗi: ${error.message}`,
      show_alert: true
    });
  }
}

export default bot;
