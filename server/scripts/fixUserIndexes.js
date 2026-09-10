import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixUserIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Xóa tất cả users có username không hợp lệ
    console.log('\n🗑️  Đang xóa users có username không hợp lệ...');
    const deleteResult = await usersCollection.deleteMany({
      $or: [
        { username: null },
        { username: '' },
        { username: 'undefined' },
        { username: 'null' },
        { username: { $exists: false } }
      ]
    });
    console.log(`   ✅ Đã xóa ${deleteResult.deletedCount} users không hợp lệ`);

    // 2. Xóa index cũ trên email (nếu có)
    console.log('\n🔧 Đang xóa index cũ...');
    try {
      await usersCollection.dropIndex('email_1');
      console.log('   ✅ Đã xóa index cũ: email_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('   ℹ️  Index email_1 không tồn tại, bỏ qua');
      } else {
        throw error;
      }
    }

    // 3. Tạo index mới cho username
    console.log('\n🔨 Đang tạo index mới cho username...');
    await usersCollection.createIndex(
      { username: 1 },
      { unique: true, name: 'username_1' }
    );
    console.log('   ✅ Đã tạo unique index: username_1');

    // 4. Kiểm tra lại
    console.log('\n📊 Kiểm tra lại database:');
    const totalCount = await usersCollection.countDocuments();
    console.log(`   - Tổng số users: ${totalCount}`);

    const indexes = await usersCollection.indexes();
    console.log('   - Indexes:');
    indexes.forEach(index => {
      console.log(`     • ${index.name}: ${JSON.stringify(index.key)}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Hoàn tất! Database đã được dọn dẹp và index đã được fix.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixUserIndexes();
