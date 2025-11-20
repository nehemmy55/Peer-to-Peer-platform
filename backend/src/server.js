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

// CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://peertopeer-platform.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add root route to test if backend is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'Peer to Peer Learning Platform API',
    status: 'Running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Add health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

const upsertAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '12345';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const existingByEmail = await User.findOne({ email: adminEmail });
    if (existingByEmail) {
      if (existingByEmail.role !== 'admin' || !(await bcrypt.compare(adminPassword, existingByEmail.passwordHash))) {
        existingByEmail.role = 'admin';
        existingByEmail.passwordHash = passwordHash;
        existingByEmail.password = adminPassword;
        existingByEmail.name = existingByEmail.name || 'Admin';
        await existingByEmail.save();
        console.log('Admin user updated');
      } else {
        console.log('Admin user already configured');
      }
      return;
    }

    await User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      password: adminPassword,
      role: 'admin',
      school: ''
    });
    console.log('Admin user created');
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
};

// MongoDB connection with better error handling
console.log('Attempting MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected successfully');
    await upsertAdmin();
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    console.log('Please check your MONGODB_URI environment variable');
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log(' MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.log(' MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' MongoDB disconnected');
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { 
    origin: [
      'http://localhost:5173',
      'https://peertopeer-platform.netlify.app'
    ],
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected');
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return socket.disconnect(true);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const room = `user:${payload.id}`;
    socket.join(room);
    console.log(`User ${payload.id} joined room ${room}`);
  } catch (error) {
    console.log('Socket authentication failed');
    socket.disconnect(true);
  }
});

server.listen(port, () => {
  console.log(` Server running on port ${port}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
  console.log(` MongoDB status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(` Health check: http://localhost:${port}/health`);
});