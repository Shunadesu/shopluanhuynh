import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';
import { calculateSpinsAwarded } from '../utils/spinLogic.js';

async function debugUserSpins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Get all users có deposit hoặc có balance > 0
    const users = await User.find({
      $or: [
        { totalDeposited: { $gt: 0 } },
        { balance: { $gt: 0 } }
      ]
    }).select('username fullName balance totalDeposited spins').lean();

    console.log(`📋 FOUND ${users.length} USERS WITH DEPOSITS/BALANCE:\n`);

    for (const user of users) {
      console.log(`👤 ${user.username} (${user.fullName || 'N/A'})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Balance: ${(user.balance || 0).toLocaleString('vi-VN')}đ`);
      console.log(`   Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
      console.log(`   Spins: ${user.spins || 0}`);
      
      // Calculate expected spins
      const expectedSpins = Math.floor((user.totalDeposited || 0) / 200000);
      const actualSpins = user.spins || 0;
      
      if (expectedSpins !== actualSpins) {
        console.log(`   ⚠️  MISMATCH! Expected ${expectedSpins} spins but has ${actualSpins}`);
      } else {
        console.log(`   ✅ Spins correct`);
      }
      
      // Get approved deposits for this user
      const deposits = await DepositRequest.find({
        userId: user._id,
        status: 'approved'
      }).select('amount createdAt processedAt').sort({ createdAt: 1 }).lean();
      
      if (deposits.length > 0) {
        console.log(`   📊 ${deposits.length} approved deposits:`);
        let cumulative = 0;
        deposits.forEach((dep, idx) => {
          cumulative += dep.amount;
          const spinsBefore = Math.floor((cumulative - dep.amount) / 200000);
          const spinsAfter = Math.floor(cumulative / 200000);
          const earned = spinsAfter - spinsBefore;
          console.log(`      ${idx + 1}. ${dep.amount.toLocaleString('vi-VN')}đ → +${earned} spins (total: ${spinsAfter})`);
        });
      } else {
        console.log(`   📊 No approved deposits found`);
      }
      
      console.log('');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total users with deposits: ${users.length}`);
    console.log(`   Users with spins: ${users.filter(u => (u.spins || 0) > 0).length}`);
    console.log(`   Total spins distributed: ${users.reduce((sum, u) => sum + (u.spins || 0), 0)}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugUserSpins();
