import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';
import emailChecker from '../services/emailChecker.js';

dotenv.config();

async function testSmartScheduler() {
  try {
    console.log('🧪 Testing Smart Email Checker Scheduler\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Không có pending deposits
    console.log('📋 Test 1: No pending deposits');
    console.log('   Deleting all pending deposits...');
    await DepositRequest.deleteMany({ status: 'pending' });
    
    await emailChecker.checkAndSchedule();
    console.log(`   Expected: ⏸️ Paused`);
    console.log(`   Actual isEnabled: ${emailChecker.isEnabled}\n`);

    // Test 2: Tạo deposit mới → checker should enable
    console.log('📋 Test 2: Create new pending deposit');
    
    const testUser = await User.findOne().limit(1);
    if (!testUser) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    // Get a bank account or create a test one
    const BankAccount = (await import('../models/BankAccount.js')).default;
    let bankAccount = await BankAccount.findOne({ isActive: true });
    if (!bankAccount) {
      console.log('   Creating test bank account...');
      bankAccount = new BankAccount({
        bankName: 'ACB',
        accountNumber: '123456789',
        accountName: 'TEST ACCOUNT',
        identifier: 'test-acb-account',
        isActive: true,
        order: 1
      });
      await bankAccount.save();
    }

    const testDeposit = new DepositRequest({
      userId: testUser._id,
      amount: 50000,
      depositMethod: 'bank',
      bankAccountId: bankAccount._id,
      transferNote: 'TEST' + Date.now(),
      status: 'pending'
    });
    await testDeposit.save();
    console.log(`   Created deposit: ${testDeposit.transferNote}`);
    
    await emailChecker.checkAndSchedule();
    console.log(`   Expected: ✅ Enabled`);
    console.log(`   Actual isEnabled: ${emailChecker.isEnabled}\n`);

    // Test 3: Tạo deposit đã expired (6 phút trước)
    console.log('📋 Test 3: Create expired deposit (6 mins ago)');
    
    const expiredDeposit = new DepositRequest({
      userId: testUser._id,
      amount: 100000,
      depositMethod: 'bank',
      bankAccountId: bankAccount._id,
      transferNote: 'EXPIRED' + Date.now(),
      status: 'pending',
      createdAt: new Date(Date.now() - 6 * 60 * 1000) // 6 phút trước
    });
    await expiredDeposit.save();
    console.log(`   Created expired deposit: ${expiredDeposit.transferNote}`);
    
    console.log('   Waiting 2 seconds before auto-reject check...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await emailChecker.autoRejectExpiredDeposits();
    
    const checkExpired = await DepositRequest.findById(expiredDeposit._id);
    console.log(`   Expected status: rejected`);
    console.log(`   Actual status: ${checkExpired.status}`);
    console.log(`   Admin note: ${checkExpired.adminNote}\n`);

    // Test 4: Check còn lại bao nhiêu pending
    const remainingPending = await DepositRequest.countDocuments({ 
      status: 'pending',
      depositMethod: 'bank'
    });
    console.log(`📋 Test 4: Remaining pending deposits: ${remainingPending}`);
    console.log(`   Expected: 1 (testDeposit only)`);
    console.log(`   Actual: ${remainingPending}\n`);

    // Test 5: Approve deposit → checker should pause
    console.log('📋 Test 5: Approve remaining deposit');
    testDeposit.status = 'approved';
    testDeposit.processedAt = new Date();
    await testDeposit.save();
    console.log(`   Approved: ${testDeposit.transferNote}`);
    
    await emailChecker.checkAndSchedule();
    console.log(`   Expected: ⏸️ Paused (no more pending)`);
    console.log(`   Actual isEnabled: ${emailChecker.isEnabled}\n`);

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await DepositRequest.deleteMany({ 
      transferNote: { $regex: /^(TEST|EXPIRED)/ }
    });

    console.log('\n✅ All tests completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testSmartScheduler();
