import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function checkUserSpins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    const users = await User.find({}).select('username fullName spins totalDeposited balance').lean();
    
    console.log('📊 User Spins Status:\n');
    console.log('═'.repeat(80));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach(user => {
        console.log(`👤 ${user.fullName} (@${user.username})`);
        console.log(`   💰 Balance: ${user.balance?.toLocaleString('vi-VN') || 0}đ`);
        console.log(`   📥 Total Deposited: ${user.totalDeposited?.toLocaleString('vi-VN') || 0}đ`);
        console.log(`   🎡 Spins: ${user.spins || 0}`);
        console.log('─'.repeat(80));
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserSpins();
