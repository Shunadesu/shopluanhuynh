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

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const username = 'testa123';
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User ${username} not found`);
      await mongoose.connection.close();
      return;
    }

    console.log('👤 USER INFO:');
    console.log('='.repeat(80));
    console.log(`Username: ${user.username}`);
    console.log(`Full Name: ${user.fullName}`);
    console.log(`Balance: ${(user.balance || 0).toLocaleString('vi-VN')}đ`);
    console.log(`Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`Spins Available: ${user.spins || 0}`);
    console.log(`Expected Spins: ${Math.floor((user.totalDeposited || 0) / 200000)}`);
    console.log(`Created At: ${user.createdAt}`);
    
    // Check deposits
    console.log('\n💳 DEPOSITS:');
    console.log('='.repeat(80));
    const deposits = await DepositRequest.find({ userId: user._id }).sort({ createdAt: -1 });
    
    deposits.forEach((dep, idx) => {
      console.log(`\n[${idx + 1}] ${dep.status.toUpperCase()}`);
      console.log(`    Amount: ${dep.amount.toLocaleString('vi-VN')}đ`);
      console.log(`    Method: ${dep.depositMethod}`);
      console.log(`    Transfer Note: ${dep.transferNote}`);
      console.log(`    Created: ${dep.createdAt}`);
      if (dep.status === 'approved') {
        console.log(`    ✅ Processed: ${dep.processedAt}`);
        console.log(`    Auto Approved: ${dep.autoApproved}`);
      }
    });

    // Check spin history
    console.log('\n🎡 SPIN HISTORY:');
    console.log('='.repeat(80));
    const spins = await SpinHistory.find({ userId: user._id }).sort({ spinAt: -1 });
    
    if (spins.length === 0) {
      console.log('No spins yet');
    } else {
      spins.forEach((spin, idx) => {
        console.log(`\n[${idx + 1}] ${spin.rewardType.toUpperCase()}: ${spin.rewardLabel}`);
        console.log(`    Value: ${spin.rewardValue || 0}đ`);
        console.log(`    Spin At: ${spin.spinAt}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`   Total Approved Deposits: ${deposits.filter(d => d.status === 'approved').length}`);
    console.log(`   Total Deposit Amount: ${deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0).toLocaleString('vi-VN')}đ`);
    console.log(`   User.totalDeposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   User.spins: ${user.spins || 0}`);
    console.log(`   Expected Spins: ${Math.floor((user.totalDeposited || 0) / 200000)}`);
    console.log(`   Spins Used: ${spins.length}`);
    
    const expectedSpins = Math.floor((user.totalDeposited || 0) / 200000);
    const actualSpins = user.spins || 0;
    
    if (actualSpins !== expectedSpins) {
      console.log(`\n⚠️  MISMATCH: Expected ${expectedSpins} spins but user has ${actualSpins}`);
    } else {
      console.log(`\n✅ Spins are correct!`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
