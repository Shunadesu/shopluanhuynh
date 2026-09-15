import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Script để fix dữ liệu cho users đã được cộng balance thủ công
 * nhưng chưa có totalDeposited và spins
 */
async function fixUserSpins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Find users có balance > 0 nhưng totalDeposited = 0 hoặc undefined
    const users = await User.find({
      balance: { $gt: 0 },
      $or: [
        { totalDeposited: { $exists: false } },
        { totalDeposited: 0 }
      ]
    });

    console.log(`🔍 Found ${users.length} users with balance but no totalDeposited\n`);
    console.log('═'.repeat(80));

    if (users.length === 0) {
      console.log('✅ No users need fixing!');
    } else {
      for (const user of users) {
        const oldBalance = user.balance;
        const oldTotalDeposited = user.totalDeposited || 0;
        const oldSpins = user.spins || 0;

        // Tính totalDeposited = balance hiện tại
        const newTotalDeposited = user.balance;
        
        // Tính spins dựa trên công thức: 200,000đ = 1 lượt
        const newSpins = Math.floor(newTotalDeposited / 200000);

        // Update
        user.totalDeposited = newTotalDeposited;
        user.spins = newSpins;
        await user.save();

        console.log(`👤 ${user.fullName} (@${user.username})`);
        console.log(`   Before:`);
        console.log(`     💰 Balance: ${oldBalance.toLocaleString('vi-VN')}đ`);
        console.log(`     📥 Total Deposited: ${oldTotalDeposited.toLocaleString('vi-VN')}đ`);
        console.log(`     🎡 Spins: ${oldSpins}`);
        console.log(`   After:`);
        console.log(`     💰 Balance: ${user.balance.toLocaleString('vi-VN')}đ (unchanged)`);
        console.log(`     📥 Total Deposited: ${user.totalDeposited.toLocaleString('vi-VN')}đ ✅`);
        console.log(`     🎡 Spins: ${user.spins} ✅`);
        console.log('─'.repeat(80));
      }

      console.log(`\n✅ Fixed ${users.length} users!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserSpins();
