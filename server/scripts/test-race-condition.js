import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SpinReward from '../models/SpinReward.js';
import GameAccount from '../models/GameAccount.js';
import Category from '../models/Category.js';

dotenv.config();

const testRaceCondition = async () => {
  try {
    console.log('🧪 Test Race Condition - Vòng quay\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Create test data
    console.log('📝 Tạo dữ liệu test...');
    
    // Create test user with spins
    const testUser = await User.create({
      username: 'test' + Date.now().toString().slice(-10),
      password: 'test123456',
      fullName: 'Test User',
      freeSpins: 10,
      premiumSpins: 10,
      balance: 1000000
    });
    console.log(`✅ User test: ${testUser.username}`);

    // Create test category first with unique name
    const testCategory = await Category.create({
      name: 'Test Category ' + Date.now(),
      slug: 'test-' + Date.now(),
      description: 'Category for testing'
    });

    // Create test account
    const testAccount = await GameAccount.create({
      categoryId: testCategory._id,
      title: 'Test Account',
      price: 100000,
      status: 'available',
      username: 'testaccount',
      password: 'testpass',
      server: 'Test Server',
      rank: 'Test Rank',
      heroes: 10,
      skins: 5,
      images: ['test.jpg']
    });
    console.log(`✅ Account test: ${testAccount.title}`);

    // Create test spin reward với stock = 1
    const testReward = await SpinReward.create({
      type: 'free',
      label: 'Test Account Reward',
      rewardType: 'account',
      accountId: testAccount._id,
      probability: 100,
      stock: 1, // CHỈ CÓ 1 - ĐỂ TEST RACE CONDITION
      isActive: true
    });
    console.log(`✅ Reward test: ${testReward.label} (stock: ${testReward.stock})`);

    console.log('\n🏁 Mô phỏng 5 request quay cùng lúc...');
    console.log('   (Chỉ 1 request sẽ trúng account, 4 request khác sẽ fallback)\n');

    // Simulate 5 concurrent spin requests
    const spinPromises = [];
    for (let i = 1; i <= 5; i++) {
      spinPromises.push(
        simulateSpin(testUser._id, i)
      );
    }

    const results = await Promise.allSettled(spinPromises);

    console.log('\n📊 KẾT QUẢ:\n');
    
    let successCount = 0;
    let failCount = 0;
    let accountWon = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        if (result.value.rewardType === 'account') {
          accountWon++;
          console.log(`✅ Request ${index + 1}: TRÚNG ACCOUNT`);
        } else {
          console.log(`⚪ Request ${index + 1}: ${result.value.rewardLabel}`);
        }
      } else {
        failCount++;
        console.log(`❌ Request ${index + 1}: ${result.reason}`);
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Total: ${results.length} requests`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Account won: ${accountWon}`);
    console.log('='.repeat(50));

    // Verify final state
    console.log('\n🔍 Kiểm tra trạng thái cuối cùng:\n');

    const finalAccount = await GameAccount.findById(testAccount._id);
    console.log(`Account status: ${finalAccount.status}`);
    console.log(`Account buyer: ${finalAccount.buyer || 'null'}`);

    const finalReward = await SpinReward.findById(testReward._id);
    console.log(`Reward stock: ${finalReward.stock}`);

    const finalUser = await User.findById(testUser._id);
    console.log(`User freeSpins: ${finalUser.freeSpins} (ban đầu: 10)`);

    // Assertions
    console.log('\n✅ KIỂM TRA TOÀN VẸN DỮ LIỆU:\n');

    if (accountWon === 1) {
      console.log('✅ Chỉ 1 user trúng account (ĐÚNG)');
    } else {
      console.log(`❌ ${accountWon} users trúng account (SAI - phải là 1)`);
    }

    if (finalAccount.status === 'sold') {
      console.log('✅ Account đã được đánh dấu "sold" (ĐÚNG)');
    } else {
      console.log('❌ Account vẫn available (SAI)');
    }

    if (finalReward.stock === 0) {
      console.log('✅ Stock đã về 0 (ĐÚNG)');
    } else {
      console.log(`❌ Stock còn ${finalReward.stock} (SAI - phải là 0)`);
    }

    const spinsUsed = 10 - finalUser.freeSpins;
    if (spinsUsed === successCount) {
      console.log(`✅ User đã dùng ${spinsUsed} lượt quay = ${successCount} requests thành công (ĐÚNG)`);
    } else {
      console.log(`❌ Lượt quay không khớp (SAI)`);
    }

    // Cleanup
    console.log('\n🧹 Dọn dẹp dữ liệu test...');
    await User.deleteOne({ _id: testUser._id });
    await GameAccount.deleteOne({ _id: testAccount._id });
    await SpinReward.deleteOne({ _id: testReward._id });
    console.log('✅ Đã xóa dữ liệu test');

    await mongoose.connection.close();
    console.log('\n✅ TEST HOÀN TẤT!\n');

  } catch (error) {
    console.error('❌ Test error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Simulate a spin request
async function simulateSpin(userId, requestId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Giống logic trong routes/spin.js
    const user = await User.findOne({
      _id: userId,
      freeSpins: { $gt: 0 }
    }).session(session);

    if (!user) {
      throw new Error('No spins available');
    }

    const rewards = await SpinReward.find({
      type: 'free',
      isActive: true,
      $or: [
        { stock: null },
        { stock: { $gt: 0 } }
      ]
    }).populate('accountId').session(session);

    if (rewards.length === 0) {
      throw new Error('No rewards available');
    }

    const selectedReward = rewards[0]; // Lấy reward đầu tiên (test purpose)

    let rewardData = {
      rewardType: selectedReward.rewardType,
      rewardLabel: selectedReward.label
    };

    if (selectedReward.rewardType === 'account' && selectedReward.accountId) {
      // Atomic account assignment
      const account = await GameAccount.findOneAndUpdate(
        {
          _id: selectedReward.accountId._id,
          status: 'available'
        },
        {
          $set: {
            status: 'sold',
            buyer: user._id,
            soldAt: new Date()
          }
        },
        { 
          returnDocument: 'after',
          session
        }
      );

      if (account) {
        // Decrease stock
        if (selectedReward.stock !== null) {
          await SpinReward.findByIdAndUpdate(
            selectedReward._id,
            { $inc: { stock: -1 } },
            { session }
          );
        }
      } else {
        // Fallback to nothing
        rewardData.rewardType = 'nothing';
        rewardData.rewardLabel = 'Chúc bạn may mắn lần sau';
      }
    }

    // Deduct spin
    user.freeSpins -= 1;
    await user.save({ session });

    await session.commitTransaction();
    
    return rewardData;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

testRaceCondition();
