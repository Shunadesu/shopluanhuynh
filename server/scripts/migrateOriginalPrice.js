import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameAccount from '../models/GameAccount.js';

dotenv.config();

/**
 * Migration Script: Calculate originalPrice from current price
 * 
 * Logic:
 * - All current prices are already discounted by 20%
 * - originalPrice = price / 0.8
 * - Set adminDiscountPercent = 20 for existing accounts
 */

async function migrateOriginalPrice() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find accounts with originalPrice = 0
    const accounts = await GameAccount.find({ originalPrice: 0 });
    
    console.log(`📊 Found ${accounts.length} accounts to migrate`);

    if (accounts.length === 0) {
      console.log('✅ No accounts need migration');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const account of accounts) {
      try {
        // Calculate original price: current price / 0.8 (reverse 20% discount)
        const originalPrice = Math.round(account.price / 0.8);
        
        // Update account
        account.originalPrice = originalPrice;
        account.adminDiscountPercent = 20;
        
        await account.save();
        updatedCount++;

        if (updatedCount % 50 === 0) {
          console.log(`⏳ Progress: ${updatedCount}/${accounts.length}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating account ${account.code}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${accounts.length}`);

    // Show sample of updated accounts
    const samples = await GameAccount.find({ adminDiscountPercent: 20 }).limit(5);
    console.log('\n📝 Sample migrated accounts:');
    samples.forEach(acc => {
      console.log(`   ${acc.code}: ${acc.originalPrice.toLocaleString('vi-VN')}đ → ${acc.price.toLocaleString('vi-VN')}đ (${acc.adminDiscountPercent}% off)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Migration completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateOriginalPrice();
