import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BankAccount from '../models/BankAccount.js';

dotenv.config();

/**
 * Migration: Convert qrCodeImage từ full URL (http://domain/uploads/xxx.jpg)
 * sang đường dẫn tương đối (/uploads/xxx.jpg) để frontend tự build full URL theo env.
 *
 * Chạy: node server/scripts/migrate-bank-qr.js
 */

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bankAccounts = await BankAccount.find({ qrCodeImage: { $exists: true, $ne: '' } });
    console.log(`Found ${bankAccounts.length} bank accounts with qrCodeImage`);

    let updated = 0;
    let skipped = 0;

    for (const bank of bankAccounts) {
      const oldUrl = bank.qrCodeImage;
      // Nếu đã là đường dẫn tương đối, bỏ qua
      if (oldUrl.startsWith('/uploads/')) {
        skipped++;
        continue;
      }
      // Nếu là full URL, trích xuất path
      if (oldUrl.startsWith('http://') || oldUrl.startsWith('https://')) {
        const match = oldUrl.match(/(\/uploads\/[^?#]+)/);
        if (match) {
          bank.qrCodeImage = match[1];
          await bank.save();
          updated++;
          console.log(`  Updated ${bank._id}: ${oldUrl} -> ${bank.qrCodeImage}`);
        } else {
          console.log(`  Skipped ${bank._id}: URL không chứa /uploads/ path`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`\nMigration done. Updated: ${updated}, Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrate();
