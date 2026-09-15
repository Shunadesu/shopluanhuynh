import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';

async function checkSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    const userId = '6aa9034c4f903920a11fe414';
    
    // Check if user exists
    const user = await User.findById(userId).lean();
    
    if (!user) {
      console.log(`❌ User ${userId} NOT FOUND in database!`);
      console.log('\n💡 This means the deposit you showed is from a DIFFERENT database!');
      process.exit(1);
    }
    
    console.log(`👤 USER FOUND: ${user.username}`);
    console.log(`   Full Name: ${user.fullName || 'N/A'}`);
    console.log(`   Balance: ${(user.balance || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   Spins: ${user.spins || 0}`);
    console.log(`   Created: ${user.createdAt}`);
    
    // Check deposits for this user
    const deposits = await DepositRequest.find({ userId })
      .populate('bankAccountId', 'bankName accountNumber')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`\n📊 DEPOSITS (${deposits.length}):`);
    if (deposits.length === 0) {
      console.log('   ❌ NO DEPOSITS FOUND for this user!');
    } else {
      deposits.forEach((dep, idx) => {
        console.log(`\n   ${idx + 1}. Amount: ${dep.amount.toLocaleString('vi-VN')}đ`);
        console.log(`      Status: ${dep.status}`);
        console.log(`      Bank: ${dep.bankAccountId?.bankName || 'N/A'} - ${dep.bankAccountId?.accountNumber || 'N/A'}`);
        console.log(`      Transfer Note: ${dep.transferNote}`);
        console.log(`      Created: ${dep.createdAt}`);
        console.log(`      Processed: ${dep.processedAt || 'Not yet'}`);
      });
    }
    
    // Calculate expected spins
    const expectedSpins = Math.floor((user.totalDeposited || 0) / 200000);
    console.log(`\n💫 SPIN CALCULATION:`);
    console.log(`   Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   Expected Spins: ${expectedSpins} (${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ ÷ 200,000đ)`);
    console.log(`   Actual Spins: ${user.spins || 0}`);
    
    if (expectedSpins !== (user.spins || 0)) {
      console.log(`   ⚠️  MISMATCH! Need to fix!`);
    } else {
      console.log(`   ✅ Correct!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSpecificUser();
