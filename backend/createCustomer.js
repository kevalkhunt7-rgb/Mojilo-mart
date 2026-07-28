import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import mongoose from 'mongoose';
import User from './models/User.js';

const createCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to DB');
    
    // Delete existing customer if any
    await User.deleteOne({ email: 'customer@example.com' });
    
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
      isEmailVerified: true,
      status: 'active'
    });
    
    console.log('Test customer created:', customer.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createCustomer();
