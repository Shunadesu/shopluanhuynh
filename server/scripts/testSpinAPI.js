import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function testSpinAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Get a test user
    const user = await User.findOne({ username: 'test9086156222' }).lean();
    
    if (!user) {
      console.log('❌ User test9086156222 not found');
      process.exit(1);
    }

    console.log('👤 USER DATA FROM DATABASE:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Balance: ${(user.balance || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   Total Deposited: ${(user.totalDeposited || 0).toLocaleString('vi-VN')}đ`);
    console.log(`   Spins: ${user.spins || 0}`);
    console.log(`   User ID: ${user._id}`);
    
    console.log('\n\n🔍 CHECKING WHAT /my-spins ENDPOINT WOULD RETURN:');
    console.log(`   spins: ${user.spins || 0}`);
    console.log(`   totalDeposited: ${user.totalDeposited || 0}`);
    console.log(`   isAuthenticated: true (if token is valid)`);
    
    console.log('\n\n💡 API ENDPOINT TO TEST:');
    console.log('   GET /api/spin/my-spins');
    console.log('   Headers: { Authorization: "Bearer <your_jwt_token>" }');
    
    console.log('\n\n🎯 POSSIBLE ISSUES:');
    console.log('   1. Frontend đang gọi sai endpoint');
    console.log('   2. JWT token không hợp lệ hoặc đã hết hạn');
    console.log('   3. Frontend không gửi Authorization header');
    console.log('   4. User đang dùng account khác (không phải test users)');
    console.log('   5. CORS issue');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSpinAPI();
