import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';

async function debugDepositApproval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Get the specific deposit
    const deposit = await DepositRequest.findById('6aa903534f903920a11fe425')
      .populate('userId')
      .lean();
    
    console.log('📋 DEPOSIT REQUEST:');
    console.log(JSON.stringify(deposit, null, 2));
    
    // Get user details
    const user = await User.findById('6aa9034c4f903920a11fe414').lean();
    
    console.log('\n\n👤 USER AFTER APPROVAL:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log('\n\n🔍 ANALYSIS:');
    console.log(`Deposit amount: ${deposit.amount.toLocaleString('vi-VN')}đ`);
    console.log(`Deposit status: ${deposit.status}`);
    console.log(`User balance: ${user.balance.toLocaleString('vi-VN')}đ`);
    console.log(`User totalDeposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`User spins: ${user.spins || 0}`);
    
    console.log('\n\n💡 EXPECTED:');
    const expectedSpins = Math.floor(deposit.amount / 200000);
    console.log(`Should have ${expectedSpins} spin(s) (200,000đ = 1 spin)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDepositApproval();
