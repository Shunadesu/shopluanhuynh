import crypto from 'crypto';

/**
 * Script để generate random secret token cho Telegram webhook
 * Chạy: node scripts/generateWebhookSecret.js
 */

const secretToken = crypto.randomBytes(32).toString('hex');

console.log('');
console.log('🔐 Generated Telegram Webhook Secret Token:');
console.log('');
console.log(secretToken);
console.log('');
console.log('📝 Add this to your .env file:');
console.log(`TELEGRAM_WEBHOOK_SECRET=${secretToken}`);
console.log('');
