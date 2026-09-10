import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script cleanup database production
 * - Xóa users có username/email không hợp lệ
 * - Drop index cũ email_1 (nếu tồn tại)
 * - Verify index username_1 đã đúng
 */
const fixProductionDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}`);

    const usersCollection = mongoose.connection.db.collection('users');
    const result = { steps: [] };

    // Step 1: Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    const collectionExists = collections.length > 0;
    
    if (!collectionExists) {
      console.log('\n⚠️  Collection "users" does not exist yet (fresh database)');
      console.log('✅ This is expected for a new database. Creating collection with proper schema...');
      
      // Create collection by inserting and immediately deleting a dummy document
      await usersCollection.insertOne({ _temp: true });
      await usersCollection.deleteOne({ _temp: true });
      
      console.log('✅ Collection created');
      result.steps.push({ step: 'collection_created', fresh: true });
    }

    // Step 1: Count before cleanup
    const beforeCount = await usersCollection.countDocuments();
    console.log(`\n📊 Total users before cleanup: ${beforeCount}`);
    result.steps.push({ step: 'count_before', count: beforeCount });

    // Step 2: Find invalid users
    const invalidUsers = await usersCollection.find({
      $or: [
        { username: null }, { username: '' }, { username: 'undefined' }, { username: 'null' },
        { email: null }, { email: '' }, { email: 'undefined' }, { email: 'null' },
        { username: { $exists: false } }
      ]
    }).toArray();
    console.log(`\n⚠️  Found ${invalidUsers.length} invalid users`);
    if (invalidUsers.length > 0) {
      invalidUsers.forEach(user => {
        console.log(`   - _id: ${user._id}, username: "${user.username}", email: "${user.email}"`);
      });
    }
    result.steps.push({ step: 'found_invalid', count: invalidUsers.length });

    // Step 3: Delete invalid users
    if (invalidUsers.length > 0) {
      const deleteResult = await usersCollection.deleteMany({
        $or: [
          { username: null }, { username: '' }, { username: 'undefined' }, { username: 'null' },
          { email: null }, { email: '' }, { email: 'undefined' }, { email: 'null' },
          { username: { $exists: false } }
        ]
      });
      console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} invalid users`);
      result.steps.push({ step: 'deleted_invalid', deletedCount: deleteResult.deletedCount });
    }

    // Step 4: List current indexes
    let indexesBefore = [];
    try {
      indexesBefore = await usersCollection.indexes();
      console.log('\n🔍 Current indexes:');
      indexesBefore.forEach(index => {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.log('\n⚠️  No indexes found (fresh collection)');
    }

    // Step 5: Drop old email_1 index (if exists)
    try {
      await usersCollection.dropIndex('email_1');
      console.log('\n✅ Dropped old index: email_1');
      result.steps.push({ step: 'dropped_index', name: 'email_1', success: true });
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('\n⏭️  Index email_1 does not exist (skip)');
        result.steps.push({ step: 'drop_index_skipped', name: 'email_1' });
      } else {
        console.error('\n❌ Error dropping email_1:', error.message);
        result.steps.push({ step: 'drop_index_error', name: 'email_1', error: error.message });
      }
    }

    // Step 6: Ensure username_1 unique index exists
    try {
      await usersCollection.createIndex(
        { username: 1 }, 
        { unique: true, name: 'username_1' }
      );
      console.log('\n✅ Created/verified index: username_1 (unique)');
      result.steps.push({ step: 'created_index', name: 'username_1', success: true });
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('\n⏭️  Index username_1 already exists (skip)');
        result.steps.push({ step: 'index_already_exists', name: 'username_1' });
      } else {
        console.error('\n❌ Error creating username_1:', error.message);
        result.steps.push({ step: 'create_index_error', name: 'username_1', error: error.message });
      }
    }

    // Step 7: List final indexes
    const indexesAfter = await usersCollection.indexes();
    console.log('\n🔍 Final indexes:');
    indexesAfter.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

    // Step 8: Count after cleanup
    const afterCount = await usersCollection.countDocuments();
    console.log(`\n📊 Total users after cleanup: ${afterCount}`);
    result.steps.push({ step: 'count_after', count: afterCount });

    // Step 9: Check for duplicate usernames
    const duplicates = await usersCollection.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log(`\n🔄 Duplicate usernames: ${duplicates.length}`);
    if (duplicates.length > 0) {
      console.log('⚠️  WARNING: Still have duplicates:');
      duplicates.forEach(dup => {
        console.log(`   - username: "${dup._id}" (${dup.count} users)`);
      });
    }

    result.success = true;
    result.message = `Cleanup completed: ${invalidUsers.length} invalid users deleted, indexes fixed`;
    
    console.log('\n✅ SUCCESS:', result.message);
    console.log('\n📝 Summary:');
    console.log(JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

fixProductionDatabase();
