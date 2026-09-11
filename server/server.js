import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import accountRoutes from './routes/accounts.js';
import orderRoutes from './routes/orders.js';
import depositRoutes from './routes/deposits.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import sitemapRoutes from './routes/sitemap.js';
import socialLinksRoutes from './routes/socialLinks.js';
import spinRoutes from './routes/spin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Health check (must be before any route mounts that might match /api/*)
app.get('/api/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/health hit`);
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Debug middleware to log unmatched /api requests
app.use('/api', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Unmatched /api request: ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/spin', spinRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/admin/social-links', socialLinksRoutes);

// Admin spin routes
import adminSpinRoutes from './routes/adminSpin.js';
app.use('/api/admin/spin', adminSpinRoutes);

app.use('/', sitemapRoutes);

// TEMPORARY FIX ENDPOINT - xóa sau khi fix xong
// Xóa users có username/email không hợp lệ và rebuild indexes
app.post('/api/_fix/cleanup-users', async (req, res) => {
  try {
    const usersCollection = mongoose.connection.db.collection('users');
    const result = { steps: [] };

    const beforeCount = await usersCollection.countDocuments();
    result.steps.push({ step: 'count_before', count: beforeCount });

    const invalidUsers = await usersCollection.find({
      $or: [
        { username: null }, { username: '' }, { username: 'undefined' }, { username: 'null' },
        { email: null }, { email: '' }, { email: 'undefined' }, { email: 'null' },
        { username: { $exists: false } }, { email: { $exists: false } }
      ]
    }).toArray();
    result.steps.push({ step: 'found_invalid', count: invalidUsers.length });

    const deleteResult = await usersCollection.deleteMany({
      $or: [
        { username: null }, { username: '' }, { username: 'undefined' }, { username: 'null' },
        { email: null }, { email: '' }, { email: 'undefined' }, { email: 'null' },
        { username: { $exists: false } }, { email: { $exists: false } }
      ]
    });
    result.steps.push({ step: 'deleted_invalid', deletedCount: deleteResult.deletedCount });

    // Drop index cũ (email_1)
    try {
      await usersCollection.dropIndex('email_1');
      result.steps.push({ step: 'dropped_index', name: 'email_1' });
    } catch (error) {
      if (error.code === 27) {
        result.steps.push({ step: 'drop_index_skipped', name: 'email_1' });
      } else {
        result.steps.push({ step: 'drop_index_error', name: 'email_1', error: error.message });
      }
    }

    // Tạo index mới cho username
    try {
      await usersCollection.createIndex({ username: 1 }, { unique: true, name: 'username_1' });
      result.steps.push({ step: 'created_index', name: 'username_1' });
    } catch (error) {
      result.steps.push({ step: 'create_index_error', error: error.message });
    }

    const afterCount = await usersCollection.countDocuments();
    result.steps.push({ step: 'count_after', count: afterCount });

    result.success = true;
    result.message = `Đã xóa ${deleteResult.deletedCount} users không hợp lệ và rebuild indexes`;

    console.log('✅ Cleanup endpoint executed:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cleanup', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 fallback with logging
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 fallback: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found', method: req.method, url: req.originalUrl });
});

const PORT = process.env.PORT || 9003;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
