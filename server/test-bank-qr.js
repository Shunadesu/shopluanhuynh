import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BankAccount from './models/BankAccount.js';

dotenv.config();

const TEST_QR_URL = 'https://example.com/test-qr-from-flow-update.png';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  // Tìm bản ghi đang rỗng qrCodeImage
  const bank = await BankAccount.findOne({ accountNumber: '0523372202' });
  console.log('Before:', JSON.stringify(bank, null, 2));

  if (bank) {
    // Mô phỏng flow update mới
    bank.qrCodeImage = TEST_QR_URL;
    await bank.save();
    console.log('After update:', JSON.stringify(bank, null, 2));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
