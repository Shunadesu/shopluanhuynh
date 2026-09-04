import mongoose from 'mongoose';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'luanhuynhfco2026shopluanhuynh32';
const ALGORITHM = 'aes-256-cbc';

// Encrypt function
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt function
const decrypt = (text) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const gameAccountSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: true,
    set: encrypt
  },
  password: {
    type: String,
    required: true,
    set: encrypt
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String
  }],
  rank: {
    type: String,
    trim: true
  },
  server: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Method to decrypt credentials
gameAccountSchema.methods.decryptCredentials = function() {
  return {
    username: decrypt(this.username),
    password: decrypt(this.password)
  };
};

const GameAccount = mongoose.model('GameAccount', gameAccountSchema);

export default GameAccount;
