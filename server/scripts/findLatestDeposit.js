import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';

async function findLatestDeposit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Find latest approved deposit
    const deposits = await DepositRequest.find({ status: 'approved' })
      .sort({ processedAt: -1 })
      .limit(5)
      .populate('userId')
      .lean();
    
    console.log('📋 LATEST APPROVED DEPOSITS:\n');
    
    if (deposits.length === 0) {
      console.log('❌ No approved deposits found!');
    } else {
      for (const deposit of deposits) {
        console.log('═'.repeat(80));
        console.log(`💰 Deposit ID: ${deposit._id}`);
        console.log(`   Amount: ${deposit.amount.toLocaleString('vi-VN')}đ`);
        console.log(`   Status: ${deposit.status}`);
        console.log(`   Processed at: ${deposit.processedAt}`);
        console.log(`   User ID: ${deposit.userId?._id || deposit.userId}`);
        
        if (deposit.userId && deposit.userId._id) {
          console.log(`   User: ${deposit.userId.username} (${deposit.userId.fullName})`);
          console.log(`   User balance: ${deposit.userId.balance?.toLocaleString('vi-VN') || 0}đ`);
          console.log(`   User totalDeposited: ${(deposit.userId.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
          console.log(`   User spins: ${deposit.userId.spins || 0}`);
        }
      }
      console.log('═'.repeat(80));
    }

    // Also check all users
    console.log('\n\n👥 ALL USERS:\n');
    const users = await User.find({}).select('username fullName balance totalDeposited spins').lean();
    users.forEach(user => {
      console.log(`${user.username}: balance=${user.balance}, totalDeposited=${user.totalDeposited || 0}, spins=${user.spins || 0}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findLatestDeposit();
