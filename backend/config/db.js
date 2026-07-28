import mongoose from 'mongoose';
import dns from 'dns';

// Fixes the ECONNREFUSED network issue by forcing IPv4 lookups
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    // Clean, modern connection without deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,  // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;