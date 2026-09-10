import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Script test đăng ký user trực tiếp vào database
 */
const testRegister = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Test 1: Tạo user mới
    console.log('📝 Test 1: Creating new user...');
    const testUser = {
      username: 'testuser001',
      password: '123456',
      fullName: 'Test User 001',
      phone: '0123456789'
    };

    try {
      const user = await User.create(testUser);
      console.log('✅ User created successfully:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Full Name: ${user.fullName}`);
      console.log(`   - Phone: ${user.phone}`);
      console.log(`   - Balance: ${user.balance}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - IsActive: ${user.isActive}\n`);
    } catch (error) {
      console.error('❌ Failed to create user:', error.message);
      if (error.code === 11000) {
        console.log('   Reason: Username already exists\n');
      }
    }

    // Test 2: Thử tạo duplicate username
    console.log('📝 Test 2: Trying to create duplicate username...');
    try {
      await User.create(testUser);
      console.log('❌ ERROR: Duplicate was allowed (should not happen!)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate correctly rejected');
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.error('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: List all users
    console.log('📝 Test 3: Listing all users...');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    console.log(`✅ Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.fullName}) - ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    console.log('✅ All tests completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

testRegister();
