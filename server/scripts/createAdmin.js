import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import User model
import User from '../models/User.js';

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminUsername = process.argv[2] || 'admin';
    const adminPassword = process.argv[3] || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);

      // Update password if --update flag
      if (process.argv.includes('--update-password')) {
        existingAdmin.password = adminPassword; // pre-save hook sẽ hash
        await existingAdmin.save();
        console.log('🔄 Password updated to:', adminPassword);
      }
    } else {
      // Create new admin - pre-save hook sẽ hash password
      const admin = await User.create({
        username: adminUsername,
        password: adminPassword,
        fullName: 'Administrator',
        phone: '0000000000',
        role: 'admin',
        isActive: true,
        balance: 0
      });

      console.log('✅ Admin created successfully!');
      console.log('\n📋 Admin Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Username: ' + adminUsername);
      console.log('Password: ' + adminPassword);
      console.log('Role:     admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Script completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
