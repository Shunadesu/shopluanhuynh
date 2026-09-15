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

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get sample user with deposits
    const users = await User.find({ totalDeposited: { $gt: 0 } })
      .select('username fullName balance totalDeposited spins')
      .limit(3)
      .lean();

    console.log('📊 USERS WITH DEPOSITS:');
    console.log('='.repeat(80));
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (${user.fullName})`);
      console.log(`   💰 Balance: ${user.balance?.toLocaleString('vi-VN') || 0}đ`);
      console.log(`   📈 Total Deposited: ${user.totalDeposited?.toLocaleString('vi-VN') || 0}đ`);
      console.log(`   🎡 Spins Available: ${user.spins || 0}`);
      console.log(`   📐 Expected Spins: ${Math.floor((user.totalDeposited || 0) / 200000)}`);
      
      // Check spin history
      const spinCount = await SpinHistory.countDocuments({ userId: user._id });
      console.log(`   📜 Spins Used: ${spinCount}`);
      
      // Check deposits
      const deposits = await DepositRequest.find({ 
        userId: user._id, 
        status: 'approved' 
      }).select('amount createdAt').sort({ createdAt: -1 }).limit(3);
      
      console.log(`   💳 Recent Approved Deposits:`);
      deposits.forEach(dep => {
        console.log(`      - ${dep.amount.toLocaleString('vi-VN')}đ (${new Date(dep.createdAt).toLocaleDateString('vi-VN')})`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    // Check total stats
    const totalUsers = await User.countDocuments();
    const usersWithSpins = await User.countDocuments({ spins: { $gt: 0 } });
    const totalSpinHistory = await SpinHistory.countDocuments({});
    
    console.log('\n📊 SYSTEM STATS:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Users with Spins: ${usersWithSpins}`);
    console.log(`   Total Spins Used: ${totalSpinHistory}`);

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickCheck();
