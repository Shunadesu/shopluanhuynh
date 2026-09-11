import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkMongoDBTransaction = async () => {
  try {
    console.log('🔍 Kiểm tra MongoDB Transaction Support\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Get MongoDB server info
    const admin = mongoose.connection.db.admin();
    const serverInfo = await admin.serverInfo();
    
    console.log('📊 THÔNG TIN SERVER:');
    console.log('='.repeat(50));
    console.log(`MongoDB Version: ${serverInfo.version}`);
    console.log(`Git Version: ${serverInfo.gitVersion}`);
    console.log('='.repeat(50));

    // Check if running as replica set
    const status = await admin.replSetGetStatus().catch(() => null);
    
    if (status) {
      console.log('\n✅ MongoDB đang chạy Replica Set');
      console.log(`   Replica Set Name: ${status.set}`);
      console.log(`   Members: ${status.members.length}`);
      console.log('\n✅ HỖ TRỢ TRANSACTIONS!');
    } else {
      console.log('\n⚠️  MongoDB KHÔNG chạy Replica Set');
      console.log('\n❌ KHÔNG HỖ TRỢ TRANSACTIONS!');
      console.log('\n📝 Để sử dụng transactions, bạn cần:');
      console.log('   1. Chạy MongoDB Replica Set (local hoặc cloud)');
      console.log('   2. Hoặc sử dụng MongoDB Atlas (tự động hỗ trợ)');
      console.log('\n🔧 Cách setup Replica Set local:');
      console.log('   1. Dừng MongoDB: mongod --shutdown');
      console.log('   2. Chạy lại với replica set: mongod --replSet rs0');
      console.log('   3. Init replica set: mongosh');
      console.log('      > rs.initiate()');
      console.log('      > rs.status()');
    }

    // Try to test transaction
    console.log('\n🧪 Thử nghiệm Transaction...\n');
    
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      console.log('✅ Start transaction: Thành công');
      
      await session.commitTransaction();
      console.log('✅ Commit transaction: Thành công');
      
      session.endSession();
      console.log('✅ End session: Thành công');
      
      console.log('\n✅ TRANSACTIONS HOẠT ĐỘNG BÌNH THƯỜNG!\n');
    } catch (error) {
      console.log('\n❌ LỖI KHI TEST TRANSACTION:');
      console.log(`   ${error.message}\n`);
      
      if (error.message.includes('replica set')) {
        console.log('💡 Giải pháp: Sử dụng MongoDB Atlas (miễn phí) hoặc setup Replica Set');
      }
    }

    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkMongoDBTransaction();
