import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const wipeUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

wipeUsers();
