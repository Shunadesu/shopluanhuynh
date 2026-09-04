import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import SiteSetting from './models/SiteSetting.js';

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await SiteSetting.deleteMany({});

    // Create admin user
    const admin = await User.create({
      email: 'admin@shopluanhuynh.com',
      password: 'admin123456',
      fullName: 'Admin LuanHuynh',
      phone: '0123456789',
      role: 'admin',
      isVerified: true,
      balance: 0
    });

    // Create test user
    const user = await User.create({
      email: 'user@test.com',
      password: 'user123456',
      fullName: 'Test User',
      phone: '0987654321',
      role: 'user',
      isVerified: true,
      balance: 1000000
    });

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Liên Quân Mobile',
        slug: 'lien-quan-mobile',
        description: 'Tài khoản Liên Quân Mobile các rank',
        isActive: true,
        order: 1
      },
      {
        name: 'Free Fire',
        slug: 'free-fire',
        description: 'Tài khoản Free Fire giá rẻ',
        isActive: true,
        order: 2
      },
      {
        name: 'PUBG Mobile',
        slug: 'pubg-mobile',
        description: 'Tài khoản PUBG Mobile đẹp',
        isActive: true,
        order: 3
      },
      {
        name: 'Liên Minh: Tốc Chiến',
        slug: 'lien-minh-toc-chien',
        description: 'Tài khoản Liên Minh: Tốc Chiến',
        isActive: true,
        order: 4
      },
      {
        name: 'Tốc Chiến',
        slug: 'toc-chien',
        description: 'Tài khoản Tốc Chiến giá tốt',
        isActive: true,
        order: 5
      }
    ]);

    // Create site settings
    await SiteSetting.insertMany([
      {
        key: 'site_name',
        value: 'Shopluanhuynh',
        type: 'text',
        description: 'Tên website'
      },
      {
        key: 'site_phone',
        value: '0123456789',
        type: 'text',
        description: 'Số điện thoại liên hệ'
      },
      {
        key: 'site_facebook',
        value: 'https://facebook.com/luanhuynhfco',
        type: 'text',
        description: 'Link Facebook'
      },
      {
        key: 'hero_banner_title',
        value: 'Mua Bán Tài Khoản Game Uy Tín',
        type: 'text',
        description: 'Tiêu đề banner chính'
      },
      {
        key: 'hero_banner_subtitle',
        value: 'Giá rẻ - An toàn - Bảo hành 1 đổi 1',
        type: 'text',
        description: 'Phụ đề banner chính'
      },
      {
        key: 'footer_content',
        value: 'Shopluanhuynh - Chuyên mua bán tài khoản game uy tín, giá rẻ. LuanHuynhFCO',
        type: 'html',
        description: 'Nội dung footer'
      }
    ]);

    console.log('✅ Seed data created successfully');
    console.log(`Admin email: admin@shopluanhuynh.com`);
    console.log(`Admin password: admin123456`);
    console.log(`Test user email: user@test.com`);
    console.log(`Test user password: user123456`);
    console.log(`${categories.length} categories created`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
