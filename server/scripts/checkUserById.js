import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';
import SpinHistory from '../models/SpinHistory.js';

async function checkUserById() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const userId = '6aa9034c4f903920a11fe414';
    
    // Try to find user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.log(`❌ User with ID ${userId} NOT FOUND in database!`);
      console.log('\n🔍 Checking if deposit exists...\n');
      
      const deposit = await DepositRequest.findOne({ userId });
      if (deposit) {
        console.log('✅ DEPOSIT EXISTS but USER DOES NOT EXIST!');
        console.log('='.repeat(80));
        console.log('This is the BUG! Deposit approved but user was deleted or never existed.');
        console.log('\nDeposit Details:');
        console.log(`   ID: ${deposit._id}`);
        console.log(`   Amount: ${deposit.amount.toLocaleString('vi-VN')}đ`);
        console.log(`   Status: ${deposit.status}`);
        console.log(`   Transfer Note: ${deposit.transferNote}`);
        console.log(`   Created: ${deposit.createdAt}`);
        console.log(`   Processed: ${deposit.processedAt}`);
      } else {
        console.log('❌ Deposit also not found');
      }
      
      await mongoose.connection.close();
      return;
    }

    console.log('✅ USER FOUND:');
    console.log('='.repeat(80));
    console.log(`Username: ${user.username}`);
    console.log(`Full Name: ${user.fullName}`);
    console.log(`Balance: ${(user.balance || 0).toLocaleString('vi-VN')}đ`);
    console.log(`Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`Spins Available: ${user.spins || 0}`);
    console.log(`Expected Spins: ${Math.floor((user.totalDeposited || 0) / 200000)}`);
    
    // Check deposits
    const deposits = await DepositRequest.find({ userId: user._id }).sort({ createdAt: -1 });
    console.log(`\n💳 Total Deposits: ${deposits.length}`);
    deposits.forEach((dep, idx) => {
      console.log(`   [${idx + 1}] ${dep.status} - ${dep.amount.toLocaleString('vi-VN')}đ (${dep.transferNote})`);
    });

    // Check spin history
    const spins = await SpinHistory.find({ userId: user._id });
    console.log(`\n🎡 Spins Used: ${spins.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserById();
