import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

dotenv.config();

async function migrateData() {
  try {
    // Connect to source database (test)
    const sourceUri = process.env.MONGODB_URI.replace(/\/[^\/\?]+(\?|$)/, '/test$1');
    console.log('🔌 Connecting to source database (test)...');
    const sourceConn = await mongoose.createConnection(sourceUri);
    
    // Connect to target database (p2p-learning)
    const targetUri = process.env.MONGODB_URI.replace(/\/[^\/\?]+(\?|$)/, '/p2p-learning$1');
    console.log('🔌 Connecting to target database (p2p-learning)...');
    const targetConn = await mongoose.createConnection(targetUri);

    // Migrate Questions
    console.log('📦 Migrating questions...');
    const questions = await sourceConn.db.collection('questions').find({}).toArray();
    if (questions.length > 0) {
      await targetConn.db.collection('questions').insertMany(questions);
      console.log(`✅ Migrated ${questions.length} questions`);
    }

    // Migrate Answers
    console.log('📦 Migrating answers...');
    const answers = await sourceConn.db.collection('answers').find({}).toArray();
    if (answers.length > 0) {
      await targetConn.db.collection('answers').insertMany(answers);
      console.log(`✅ Migrated ${answers.length} answers`);
    }

    // Migrate Users (optional - be careful with duplicates)
    console.log('📦 Migrating users...');
    const users = await sourceConn.db.collection('users').find({}).toArray();
    if (users.length > 0) {
      // Check for existing users by email to avoid duplicates
      for (const user of users) {
        const exists = await targetConn.db.collection('users').findOne({ email: user.email });
        if (!exists) {
          await targetConn.db.collection('users').insertOne(user);
        }
      }
      console.log(`✅ Migrated users (skipped duplicates)`);
    }

    // Migrate Notifications
    console.log('📦 Migrating notifications...');
    const notifications = await sourceConn.db.collection('notifications').find({}).toArray();
    if (notifications.length > 0) {
      await targetConn.db.collection('notifications').insertMany(notifications);
      console.log(`✅ Migrated ${notifications.length} notifications`);
    }

    console.log('✅ Migration completed successfully!');
    
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateData();