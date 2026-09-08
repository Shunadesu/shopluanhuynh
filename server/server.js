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
app.use('/', sitemapRoutes);

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
