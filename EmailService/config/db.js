const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://telogicaweb_db_user:20QPL6ImQUwM6jIo@cluster0.oe3jl52.mongodb.net/?appName=Cluster0");
    console.log('✅ MongoDB connected for Email Service');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't crash the service if MongoDB is unavailable
    return null;
  }
};

module.exports = connectDB;
