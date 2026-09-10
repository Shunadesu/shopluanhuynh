import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Đếm tổng số users
    const totalCount = await usersCollection.countDocuments();
    console.log(`\n📊 Tổng số users: ${totalCount}`);

    // 2. Lấy tất cả users
    const users = await usersCollection.find({}).toArray();
    console.log('\n👥 Danh sách users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. username: "${user.username}" | fullName: "${user.fullName}" | _id: ${user._id}`);
    });

    // 3. Kiểm tra users có username null/empty/undefined
    const invalidUsers = await usersCollection.find({
      $or: [
        { username: null },
        { username: '' },
        { username: { $exists: false } }
      ]
    }).toArray();
    console.log(`\n⚠️  Users có username không hợp lệ: ${invalidUsers.length}`);
    if (invalidUsers.length > 0) {
      invalidUsers.forEach(user => {
        console.log(`  - _id: ${user._id}, username: "${user.username}"`);
      });
    }

    // 4. Kiểm tra indexes
    const indexes = await usersCollection.indexes();
    console.log('\n🔍 Indexes hiện tại:');
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index)}`);
    });

    // 5. Kiểm tra duplicate usernames
    const duplicates = await usersCollection.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log(`\n🔄 Username bị trùng lặp: ${duplicates.length}`);
    if (duplicates.length > 0) {
      duplicates.forEach(dup => {
        console.log(`  - username: "${dup._id}" (${dup.count} users)`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugUsers();
