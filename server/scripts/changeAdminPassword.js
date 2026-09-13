import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import User model
import User from '../models/User.js';

async function changeAdminPassword() {
  try {
    // Connect to MongoDB
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    // Lấy thông số từ command line hoặc dùng mặc định
    const adminUsername = process.argv[2] || 'admin';
    const newPassword = process.argv[3] || '0948614291asd';

    console.log('📋 Thông tin đổi mật khẩu:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: ' + adminUsername);
    console.log('Mật khẩu mới: ' + newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Tìm admin user
    const admin = await User.findOne({ username: adminUsername });

    if (!admin) {
      console.error('❌ Không tìm thấy user với username:', adminUsername);
      console.log('\n💡 Gợi ý: Kiểm tra lại username hoặc tạo admin mới bằng:');
      console.log('   npm run create-admin');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hiển thị thông tin admin hiện tại
    console.log('✅ Tìm thấy admin:');
    console.log('   ID:', admin._id);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Full Name:', admin.fullName);
    console.log('   Active:', admin.isActive ? 'Yes' : 'No');
    console.log('');

    // Cập nhật mật khẩu (pre-save hook sẽ tự động hash)
    console.log('🔄 Đang cập nhật mật khẩu...');
    admin.password = newPassword;
    await admin.save();

    console.log('✅ Đổi mật khẩu thành công!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Mật khẩu đã được cập nhật và mã hóa');
    console.log('✓ Bạn có thể đăng nhập với:');
    console.log('  Username: ' + adminUsername);
    console.log('  Password: ' + newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Hoàn thành!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('\n📝 Chi tiết lỗi:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Kiểm tra nếu script được chạy trực tiếp
changeAdminPassword();
