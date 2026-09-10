import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script fix PRODUCTION database - XÓA INDEX email_1 CŨ
 */
const fixProductionOldIndex = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`URI: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@')}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Cảnh báo nếu đang ở database test
    if (dbName === 'test') {
      console.log('⚠️  WARNING: Connected to "test" database!');
      console.log('⚠️  Your .env might not have been updated or server not restarted.\n');
    }

    const usersCollection = mongoose.connection.db.collection('users');

    // Kiểm tra collection có tồn tại không
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  Collection "users" does not exist');
      console.log('✅ Creating fresh collection...\n');
      
      await usersCollection.insertOne({ _temp: true });
      await usersCollection.deleteOne({ _temp: true });
    }

    // List indexes hiện tại
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      const uniqueFlag = index.unique ? ' (UNIQUE)' : '';
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}${uniqueFlag}`);
    });
    console.log();

    // Drop index email_1 nếu tồn tại
    const hasEmailIndex = indexes.some(idx => idx.name === 'email_1');
    if (hasEmailIndex) {
      console.log('🗑️  Dropping old index: email_1...');
      try {
        await usersCollection.dropIndex('email_1');
        console.log('✅ Successfully dropped email_1 index\n');
      } catch (error) {
        console.error('❌ Failed to drop email_1:', error.message);
      }
    } else {
      console.log('✅ Index email_1 does not exist (already clean)\n');
    }

    // Tạo/verify username_1 unique index
    console.log('🔧 Creating/verifying username_1 index...');
    try {
      await usersCollection.createIndex(
        { username: 1 },
        { unique: true, name: 'username_1' }
      );
      console.log('✅ Index username_1 (unique) ready\n');
    } catch (error) {
      if (error.code === 85) {
        console.log('✅ Index username_1 already exists\n');
      } else {
        console.error('❌ Error creating username_1:', error.message, '\n');
      }
    }

    // Count users
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // List users nếu có
    if (userCount > 0 && userCount <= 10) {
      const users = await usersCollection.find()
        .project({ username: 1, fullName: 1, email: 1, role: 1 })
        .toArray();
      console.log('\n👥 Users:');
      users.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.username} (${user.fullName || 'N/A'}) - ${user.role || 'user'}`);
      });
    }

    // Final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      const uniqueFlag = index.unique ? ' (UNIQUE)' : '';
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}${uniqueFlag}`);
    });

    console.log('\n✅ SUCCESS! Database is ready.');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. If connected to "test" database:');
    console.log('   - Update .env on production server');
    console.log('   - RESTART the server: pm2 restart be_shopluanhuynh');
    console.log('   - Run this script again to verify');
    console.log('\n2. If connected to "shopluanhuynh" database:');
    console.log('   - RESTART the server: pm2 restart be_shopluanhuynh');
    console.log('   - Test registration on frontend');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

fixProductionOldIndex();
