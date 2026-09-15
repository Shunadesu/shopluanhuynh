import 'dotenv/config';
import mongoose from 'mongoose';
import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';

async function debugDeposits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Get all users
    const users = await User.find({}).select('username fullName spins totalDeposited balance').lean();
    
    console.log('👥 ALL USERS:\n');
    console.log('═'.repeat(80));
    for (const user of users) {
      console.log(`👤 ${user.fullName} (@${user.username})`);
      console.log(`   💰 Balance: ${user.balance?.toLocaleString('vi-VN') || 0}đ`);
      console.log(`   📥 Total Deposited: ${user.totalDeposited?.toLocaleString('vi-VN') || 0}đ`);
      console.log(`   🎡 Spins: ${user.spins || 0}`);
      
      // Check deposits for this user
      const deposits = await DepositRequest.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      if (deposits.length > 0) {
        console.log(`   📋 Recent Deposits (${deposits.length}):`);
        deposits.forEach((d, idx) => {
          console.log(`      ${idx + 1}. ${d.amount.toLocaleString('vi-VN')}đ - Status: ${d.status} - ${new Date(d.createdAt).toLocaleString('vi-VN')}`);
        });
        
        // Calculate expected totalDeposited
        const approvedDeposits = await DepositRequest.find({ 
          userId: user._id, 
          status: 'approved' 
        }).lean();
        
        const expectedTotal = approvedDeposits.reduce((sum, d) => sum + d.amount, 0);
        const expectedSpins = Math.floor(expectedTotal / 200000);
        
        console.log(`   ✅ Approved Deposits: ${approvedDeposits.length} deposits = ${expectedTotal.toLocaleString('vi-VN')}đ`);
        console.log(`   🧮 Expected Spins: ${expectedSpins} (${expectedTotal} / 200,000)`);
        console.log(`   ⚠️  Actual vs Expected:`);
        console.log(`      totalDeposited: ${user.totalDeposited || 0} vs ${expectedTotal} ${user.totalDeposited === expectedTotal ? '✅' : '❌'}`);
        console.log(`      spins: ${user.spins || 0} vs ${expectedSpins} ${user.spins === expectedSpins ? '✅' : '❌'}`);
      } else {
        console.log(`   📋 No deposits found`);
      }
      
      console.log('─'.repeat(80));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDeposits();
