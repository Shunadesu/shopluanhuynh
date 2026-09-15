import 'dotenv/config';
import mongoose from 'mongoose';
import SpinReward from '../models/SpinReward.js';
import GameAccount from '../models/GameAccount.js';

async function testSpinConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}\n`);

    // Simulate what /spin/config returns
    const rewards = await SpinReward.find({
      isActive: true,
      $or: [
        { stock: null },
        { stock: { $gt: 0 } }
      ]
    }).populate('accountId', 'title price images').sort({ probability: -1 });

    console.log('🎯 /spin/config will return (in this order):\n');
    console.log('═'.repeat(80));
    
    rewards.forEach((reward, idx) => {
      console.log(`Index ${idx}: ${reward.label}`);
      console.log(`   _id: ${reward._id}`);
      console.log(`   Type: ${reward.rewardType}`);
      console.log(`   Probability: ${reward.probability}%`);
      console.log(`   Color: ${reward.color}`);
      console.log('─'.repeat(80));
    });

    console.log('\n🎲 Simulate 5 spins to see what backend would select:\n');
    
    for (let i = 0; i < 5; i++) {
      const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
      let random = Math.random() * totalProbability;
      
      let selectedReward = null;
      for (const reward of rewards) {
        random -= reward.probability;
        if (random <= 0) {
          selectedReward = reward;
          break;
        }
      }
      
      if (!selectedReward) {
        selectedReward = rewards[0];
      }
      
      const indexInArray = rewards.findIndex(r => r._id.toString() === selectedReward._id.toString());
      
      console.log(`Spin ${i + 1}:`);
      console.log(`   Selected: ${selectedReward.label}`);
      console.log(`   _id: ${selectedReward._id}`);
      console.log(`   Should point to index: ${indexInArray}`);
      console.log('');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSpinConfig();
