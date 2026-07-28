import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import mongoose from 'mongoose';
import User from './models/User.js';

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to DB');
    const users = await User.find({});
    console.log('Users found:', users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
