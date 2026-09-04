import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// User Schema (inline for script)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  purchaseHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      const updatePassword = process.argv.includes('--update-password');
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('🔄 Password updated to: admin123');
      }
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        fullName: 'Administrator',
        phone: '0000000000',
        role: 'admin',
        isVerified: true,
        isActive: true,
        balance: 0
      });

      await admin.save();
      console.log('✅ Admin created successfully!');
      console.log('\n📋 Admin Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    admin@gmail.com');
      console.log('Password: admin123');
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
