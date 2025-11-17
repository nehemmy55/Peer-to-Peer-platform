import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Answer from '../models/Answer.js';
import User from '../models/User.js';

dotenv.config();

// Migration script to add authorId to answers
async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const toFix = await Answer.find({ $or: [{ authorId: { $exists: false } }, { authorId: null }] });
    console.log(`Found ${toFix.length} answers missing authorId`);

    let updated = 0;
    for (const a of toFix) {
      if (!a.author) continue;
      const user = await User.findOne({ name: a.author });
      if (!user) {
        console.log(`No user found with name="${a.author}" for answer ${a._id}`);
        continue;
      }
      a.authorId = user._id;
      await a.save();
      updated++;
    }
    console.log(`Updated ${updated} answers with authorId`);
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();