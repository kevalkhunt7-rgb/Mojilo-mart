import mongoose from 'mongoose';
import fs from 'fs';

const MONGO_URI = 'mongodb+srv://mrviradiya05_db_user:tj3yMMqspjvlo8dw@cluster0.9fcfamn.mongodb.net/Mojilomart?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const variants = await mongoose.connection.db.collection('productvariants').find({ product: new mongoose.Types.ObjectId("6a5b0ad41578495d1e2d814f") }).toArray();
  console.log('VARIANTS IN DB:', JSON.stringify(variants, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
