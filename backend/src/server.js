
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
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upsertAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '12345';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // find by email and ensure role/password are correct
    const existingByEmail = await User.findOne({ email: adminEmail });
    if (existingByEmail) {
      if (existingByEmail.role !== 'admin' || !(await bcrypt.compare(adminPassword, existingByEmail.passwordHash))) {
        existingByEmail.role = 'admin';
        existingByEmail.passwordHash = passwordHash;
        existingByEmail.password = adminPassword; // Store plain text password
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
      password: adminPassword, // Store plain text password
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
app.use('/api/admin', adminRouter);

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});
app.set('io', io);

io.on('connection', (socket) => {
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return socket.disconnect(true);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const room = `user:${payload.id}`;
    socket.join(room);
  } catch {
    socket.disconnect(true);
  }
});

// Replace app.listen with server.listen
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
