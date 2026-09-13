import Imap from 'imap';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing Gmail IMAP Connection...\n');

console.log('📧 Configuration:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER);
console.log('   EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '****' + process.env.EMAIL_APP_PASSWORD.slice(-4) : 'NOT SET');
console.log('   BANK_EMAIL_FROM:', process.env.BANK_EMAIL_FROM);
console.log('');

if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
  console.error('❌ EMAIL_USER chưa được cấu hình trong .env');
  console.error('   Vui lòng sửa EMAIL_USER=your-email@gmail.com thành email thật\n');
  process.exit(1);
}

if (!process.env.EMAIL_APP_PASSWORD) {
  console.error('❌ EMAIL_APP_PASSWORD chưa được cấu hình trong .env');
  console.error('   Vui lòng lấy App Password từ https://myaccount.google.com/apppasswords\n');
  process.exit(1);
}

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, ''), // Remove spaces
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

let testPassed = false;

imap.once('ready', () => {
  console.log('✅ IMAP connection successful!');
  
  imap.openBox('INBOX', true, (err, box) => {
    if (err) {
      console.error('❌ Error opening INBOX:', err.message);
      imap.end();
      return;
    }

    console.log('✅ INBOX opened successfully');
    console.log(`   Total messages: ${box.messages.total}`);
    console.log(`   Unread messages: ${box.messages.new}`);
    console.log('');

    // Search for recent ACB emails
    const searchCriteria = [['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]]; // Last 7 days
    if (process.env.BANK_EMAIL_FROM) {
      searchCriteria.push(['FROM', process.env.BANK_EMAIL_FROM]);
    }

    imap.search(searchCriteria, (err, results) => {
      if (err) {
        console.error('❌ Search error:', err.message);
      } else {
        console.log(`📬 Found ${results ? results.length : 0} email(s) from ${process.env.BANK_EMAIL_FROM || 'any sender'} in last 7 days`);
      }
      
      testPassed = true;
      imap.end();
    });
  });
});

imap.once('error', (err) => {
  console.error('❌ IMAP connection error:', err.message);
  console.error('');
  
  if (err.message.includes('Invalid credentials')) {
    console.error('💡 Giải pháp:');
    console.error('   1. Kiểm tra EMAIL_USER có đúng địa chỉ Gmail không');
    console.error('   2. Kiểm tra EMAIL_APP_PASSWORD có phải là App Password không');
    console.error('      (Không phải password Gmail thường)');
    console.error('   3. Đảm bảo 2-Step Verification đã bật');
    console.error('   4. Lấy App Password mới từ: https://myaccount.google.com/apppasswords');
  } else if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
    console.error('💡 Giải pháp:');
    console.error('   1. Kiểm tra kết nối internet');
    console.error('   2. Kiểm tra firewall có block port 993 không');
  }
  
  console.error('');
  process.exit(1);
});

imap.once('end', () => {
  if (testPassed) {
    console.log('✅ Test completed successfully!');
    console.log('');
    console.log('🎉 Email checker sẽ hoạt động bình thường.');
    console.log('📝 Bây giờ bạn có thể test bằng cách:');
    console.log('   1. Tạo deposit request từ frontend');
    console.log('   2. Chuyển tiền thật vào ACB với nội dung = mã giao dịch');
    console.log('   3. Chờ email ACB gửi về Gmail');
    console.log('   4. Server sẽ tự động approve trong vòng 30 giây');
    console.log('');
  }
  process.exit(testPassed ? 0 : 1);
});

console.log('🔌 Connecting to Gmail IMAP...');
imap.connect();

// Timeout sau 30 giây
setTimeout(() => {
  if (!testPassed) {
    console.error('❌ Connection timeout after 30s');
    process.exit(1);
  }
}, 30000);
