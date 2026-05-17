const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Make sure MongoDB is running: mongod --dbpath /data/db');
    console.error('Or update MONGO_URI in server/.env to point to MongoDB Atlas.');
    process.exit(1);
  }
};

module.exports = connectDB;
