// server startup + admin upsert
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRouter from './routes/auth.js';
import questionsRouter from './routes/questions.js';
import answersRouter from './routes/answers.js';
import contributorsRouter from './routes/contributors.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upsertAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('12345', salt);

    // find by email and ensure role/password are correct
    const existingByEmail = await User.findOne({ email: adminEmail });
    if (existingByEmail) {
      if (existingByEmail.role !== 'admin' || !(await bcrypt.compare('12345', existingByEmail.passwordHash))) {
        existingByEmail.role = 'admin';
        existingByEmail.passwordHash = passwordHash;
        existingByEmail.name = existingByEmail.name || 'Admin';
        await existingByEmail.save();
        console.log('Admin user updated');
      } else {
        console.log('Admin user already configured');
      }
      return;
    }

    // if a different admin exists with another email, keep it but also create our predefined one
    await User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      school: ''
    });
    console.log('Admin user created');
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await upsertAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/notifications', notificationsRouter);

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
