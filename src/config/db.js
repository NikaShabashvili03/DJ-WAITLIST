import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || undefined
    });

    isConnected = true;
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection errors:', error);
    throw error;
  }
};

export default connectDB;