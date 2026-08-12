import mongoose from 'mongoose';
import dns from 'dns';

// Fixes the ECONNREFUSED network issue by forcing IPv4 lookups
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

// Disable Mongoose command buffering so queries fail-fast if connection is not ready
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000, // Extend timeout from 10s default to 45s
  maxPoolSize: 50,
  minPoolSize: 10
});
    mongoose.set("debug", function (collectionName, method, query, doc) {
  console.log(
    `[MONGO] ${collectionName}.${method}`,
    JSON.stringify(query),
    doc || ""
  );
});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
 
};

export default connectDB;
