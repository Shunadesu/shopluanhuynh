import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Script xóa test users (username bắt đầu bằng "test")
 */
const cleanupTestUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Tìm tất cả test users
    const testUsers = await User.find({
      username: { $regex: /^test/i }
    }).select('username fullName');

    console.log(`📊 Found ${testUsers.length} test users:`);
    testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.fullName})`);
    });

    if (testUsers.length === 0) {
      console.log('\n✅ No test users to clean up');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('\n⚠️  These users will be deleted!');
    console.log('Press Ctrl+C to cancel within 5 seconds...\n');

    // Đợi 5 giây để user có thể cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Xóa test users
    const result = await User.deleteMany({
      username: { $regex: /^test/i }
    });

    console.log(`✅ Deleted ${result.deletedCount} test users\n`);

    // List users còn lại
    const remainingUsers = await User.find().select('username fullName role');
    console.log(`📊 Remaining users: ${remainingUsers.length}`);
    remainingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.fullName}) - ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
};

cleanupTestUsers();
