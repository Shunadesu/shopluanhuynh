import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameAccount from '../models/GameAccount.js';

dotenv.config();

const generateAccountCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find accounts without code
    const accounts = await GameAccount.find({
      $or: [
        { code: { $exists: false } },
        { code: null },
        { code: '' }
      ]
    });

    console.log(`📝 Found ${accounts.length} accounts without code`);

    if (accounts.length === 0) {
      console.log('✅ All accounts already have codes!');
      process.exit(0);
    }

    let updated = 0;
    for (const account of accounts) {
      // Generate unique code
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 3).toUpperCase();
      account.code = `ACC${timestamp}${random}`;
      
      try {
        await account.save();
        updated++;
        console.log(`✓ Updated ${account.title} with code: ${account.code}`);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key, try again with different random
          const newRandom = Math.random().toString(36).substr(2, 4).toUpperCase();
          account.code = `ACC${timestamp}${newRandom}`;
          await account.save();
          updated++;
          console.log(`✓ Updated ${account.title} with code: ${account.code} (retry)`);
        } else {
          console.error(`✗ Failed to update ${account.title}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully updated ${updated}/${accounts.length} accounts`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

generateAccountCodes();
