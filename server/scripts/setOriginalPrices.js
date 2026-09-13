/**
 * Script để tạo giá gốc (originalPrice) từ giá bán hiện tại (price)
 * Logic: originalPrice = price + 20%
 * 
 * Chỉ cập nhật các tài khoản chưa có originalPrice
 */

import mongoose from 'mongoose';
import GameAccount from '../models/GameAccount.js';
import dotenv from 'dotenv';

dotenv.config();

const MARKUP_PERCENT = 20; // Cộng thêm 20% để tạo giá gốc
const UPDATE_ALL = process.argv.includes('--all'); // Dùng --all để cập nhật toàn bộ

async function setOriginalPrices() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Kiểm tra tất cả tài khoản
    const allAccounts = await GameAccount.find({});
    console.log(`📊 Tổng số tài khoản: ${allAccounts.length}\n`);

    let accounts;
    
    if (UPDATE_ALL) {
      // Cập nhật TẤT CẢ tài khoản
      console.log('⚠️  Chế độ: CẬP NHẬT TẤT CẢ (--all)\n');
      accounts = allAccounts;
    } else {
      // Chỉ cập nhật tài khoản chưa có originalPrice
      accounts = await GameAccount.find({
        $or: [
          { originalPrice: { $exists: false } },
          { originalPrice: 0 },
          { originalPrice: null }
        ]
      });
    }

    console.log(`📊 Tìm thấy ${accounts.length} tài khoản cần cập nhật giá gốc\n`);

    if (accounts.length === 0) {
      console.log('ℹ️  Tất cả tài khoản đã có giá gốc');
      console.log('ℹ️  Để xem chi tiết hoặc cập nhật lại, sửa điều kiện trong script\n');
      
      // Hiển thị 3 tài khoản mẫu
      const samples = allAccounts.slice(0, 3);
      console.log('📋 Mẫu 3 tài khoản đầu tiên:');
      samples.forEach(acc => {
        console.log(`   ${acc.title}`);
        console.log(`   - Giá bán: ${(acc.price || 0).toLocaleString('vi-VN')}đ`);
        console.log(`   - Giá gốc: ${(acc.originalPrice || 0).toLocaleString('vi-VN')}đ`);
        console.log(`   - Discount: ${acc.adminDiscountPercent || 0}%\n`);
      });
      
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;

    for (const account of accounts) {
      const currentPrice = account.price || 0;

      if (currentPrice === 0) {
        console.log(`⚠️  Skip: ${account.title} - giá bán = 0`);
        skipped++;
        continue;
      }

      // Tính giá gốc = giá bán + 20%
      const originalPrice = Math.round(currentPrice * (1 + MARKUP_PERCENT / 100));

      // Cập nhật
      account.originalPrice = originalPrice;
      account.adminDiscountPercent = MARKUP_PERCENT; // Set discount percent
      await account.save();

      console.log(`✅ ${account.title}`);
      console.log(`   Giá bán: ${currentPrice.toLocaleString('vi-VN')}đ`);
      console.log(`   Giá gốc: ${originalPrice.toLocaleString('vi-VN')}đ (+${MARKUP_PERCENT}%)\n`);

      updated++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Hoàn thành!`);
    console.log(`   - Đã cập nhật: ${updated} tài khoản`);
    console.log(`   - Bỏ qua: ${skipped} tài khoản`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
    process.exit(0);
  }
}

// Chạy script
setOriginalPrices();
