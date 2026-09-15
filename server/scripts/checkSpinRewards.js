import 'dotenv/config';
import mongoose from 'mongoose';
import SpinReward from '../models/SpinReward.js';

async function checkSpinRewards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    const rewards = await SpinReward.find({}).populate('accountId', 'title').lean();
    
    console.log('🎁 Spin Rewards Status:\n');
    console.log('═'.repeat(80));
    
    if (rewards.length === 0) {
      console.log('❌ No spin rewards found in database');
      console.log('\n💡 Suggestion: Create rewards in admin panel first');
    } else {
      console.log(`Total Rewards: ${rewards.length}\n`);
      
      rewards.forEach((reward, idx) => {
        console.log(`${idx + 1}. ${reward.label}`);
        console.log(`   Type: ${reward.rewardType}`);
        console.log(`   Probability: ${reward.probability}%`);
        console.log(`   Active: ${reward.isActive ? '✅ Yes' : '❌ No'}`);
        
        if (reward.rewardType === 'cash') {
          console.log(`   Value: ${reward.value?.toLocaleString('vi-VN')}đ`);
        } else if (reward.rewardType === 'account' && reward.accountId) {
          console.log(`   Account: ${reward.accountId.title}`);
        } else if (reward.rewardType === 'voucher') {
          console.log(`   Code: ${reward.voucherCode}`);
          console.log(`   Discount: ${reward.voucherDiscount}%`);
        }
        
        if (reward.stock !== null && reward.stock !== undefined) {
          console.log(`   Stock: ${reward.stock}`);
        } else {
          console.log(`   Stock: Unlimited`);
        }
        
        console.log(`   Color: ${reward.color}`);
        console.log('─'.repeat(80));
      });
      
      // Summary
      const activeCount = rewards.filter(r => r.isActive).length;
      const availableCount = rewards.filter(r => 
        r.isActive && (r.stock === null || r.stock === undefined || r.stock > 0)
      ).length;
      
      console.log('\n📊 Summary:');
      console.log(`   Total: ${rewards.length}`);
      console.log(`   Active: ${activeCount}`);
      console.log(`   Available (active + in stock): ${availableCount}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSpinRewards();
