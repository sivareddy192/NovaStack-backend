import 'dotenv/config';
import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novastack';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[NovaStack DB] MongoDB Connected to Database: "${conn.connection.name}" at host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[NovaStack DB] MongoDB connection error (${error.message}).`);
    isConnected = false;
  }
};

export const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;
