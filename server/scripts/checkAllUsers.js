import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    const users = await User.find({}).select('username fullName balance totalDeposited spins').lean();
    
    console.log('📊 ALL USERS DATA:\n');
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\n\n🔍 FILTERING LOGIC:\n');
    users.forEach(user => {
      const needsFix = user.balance > 0 && (user.totalDeposited === 0 || !user.totalDeposited);
      console.log(`${user.username}:`);
      console.log(`  balance: ${user.balance} (> 0? ${user.balance > 0})`);
      console.log(`  totalDeposited: ${user.totalDeposited} (== 0? ${user.totalDeposited === 0 || !user.totalDeposited})`);
      console.log(`  needsFix: ${needsFix}`);
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllUsers();
