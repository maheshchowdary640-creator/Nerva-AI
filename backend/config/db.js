const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DATABASE] MONGODB_URI not configured. Running without persistent database.');
    return;
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Server is running, but database connection is unavailable. Ensure MongoDB is running locally.');
  }
};

module.exports = connectDB;
