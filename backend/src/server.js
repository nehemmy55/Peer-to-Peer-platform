import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from './models/User.js';
import authRouter from './routes/auth.js';
import questionsRouter from './routes/questions.js';
import answersRouter from './routes/answers.js';
import contributorsRouter from './routes/contributors.js';
import notificationsRouter from './routes/notifications.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();

// improve CORS 
const allowedOrigins = [
  'https://peertopeer-platform.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(' CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

// Add request logging with timestamps
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin || 'No origin header');
  next();
});

// Root route 
app.get('/', (req, res) => {
  res.json({ 
    message: ' Peer to Peer Learning Platform API',
    status: 'RUNNING',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth/login, /api/auth/signup, /api/auth/me',
      questions: '/api/questions',
      answers: '/api/answers',
      contributors: '/api/contributors',
      notifications: '/api/notifications',
      admin: '/api/admin'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: ' API is working!',
    endpoint: '/api/test',
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
        console.log(' Admin user updated');
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
    console.log(' Admin user created');
  } catch (error) {
    console.error(' Error ensuring admin user:', error);
  }
};

const createTestUsers = async () => {
  try {
    console.log('Creating test users...');
    
    const testStudentEmail = 'student@test.com';
    let student = await User.findOne({ email: testStudentEmail });
    if (!student) {
      const studentHash = await bcrypt.hash('student123', 10);
      student = await User.create({
        name: 'Test Student',
        email: testStudentEmail,
        passwordHash: studentHash,
        password: 'student123',
        role: 'student',
        school: 'Test University',
        reputation: 0,
        badge: 'Newcomer',
        status: 'approved'
      });
      console.log('Test student created:', testStudentEmail);
    } else {
      console.log(' Test student exists:', testStudentEmail);
    }

    const testTeacherEmail = 'teacher@test.com';
    let teacher = await User.findOne({ email: testTeacherEmail });
    if (!teacher) {
      const teacherHash = await bcrypt.hash('teacher123', 10);
      teacher = await User.create({
        name: 'Test Teacher',
        email: testTeacherEmail,
        passwordHash: teacherHash,
        password: 'teacher123',
        role: 'teacher',
        school: 'Test College',
        reputation: 0,
        badge: 'Teacher',
        status: 'approved'
      });
      console.log(' Test teacher created:', testTeacherEmail);
    } else {
      console.log('Test teacher exists:', testTeacherEmail);
    }
  } catch (error) {
    console.log(' Could not create test users:', error.message);
  }
};

// MongoDB connection 
console.log(' Connecting to MongoDB...');
console.log(' Connection URI:', process.env.MONGODB_URI ? 
  process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');

let mongoUri = process.env.MONGODB_URI;
if (mongoUri && !mongoUri.includes('/?') && !mongoUri.match(/\/[^\/\?]+(\?|$)/)) {
  const dbName = process.env.DB_NAME || 'p2p-learning';
  mongoUri = mongoUri.endsWith('/') ? mongoUri + dbName : mongoUri + '/' + dbName;
  console.log(' Added database name to URI:', dbName);
}

mongoose.connect(mongoUri || process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'p2p-learning',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    console.log(' MongoDB connected successfully');
    console.log(' Database name:', dbName);
    console.log(' Connection state:', mongoose.connection.readyState);
    await upsertAdmin();
    await createTestUsers();
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    console.log(' Continuing without database connection');
  });

// Register routes - ORDER MATTERS
console.log(' Registering API routes...');
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
console.log(' All routes registered');

// Database info endpoint
app.get('/api/db-info', (req, res) => {
  const connection = mongoose.connection;
  res.json({
    connected: connection.readyState === 1,
    database: connection.db?.databaseName || 'Not connected',
    host: connection.host || 'Not connected',
    port: connection.port || 'Not connected',
    name: connection.name || 'Not connected',
    readyState: connection.readyState,
    readyStateText: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[connection.readyState] || 'unknown',
    collections: connection.readyState === 1 ? Object.keys(connection.collections) : []
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(' 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/test',
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'GET /api/auth/me',
      'GET /api/questions',
      'POST /api/questions',
      'GET /api/answers',
      'POST /api/answers',
      'GET /api/contributors',
      'GET /api/notifications',
      'GET /api/admin/users'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(' Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    credentials: true
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return socket.disconnect(true);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const room = `user:${payload.id}`;
    socket.join(room);
    console.log(` User ${payload.id} connected to socket`);
  } catch {
    socket.disconnect(true);
  }
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  const dbName = mongoose.connection.db?.databaseName || 'unknown';
  const host = mongoose.connection.host || 'unknown';
  console.log(' MongoDB connected - Ready for queries');
  console.log(' Active database:', dbName);
  console.log(' Connected to:', host);
  console.log(' Collections:', Object.keys(mongoose.connection.collections).join(', ') || 'None');
});

mongoose.connection.on('error', (err) => {
  console.log(' MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' MongoDB disconnected');
});

server.listen(port, () => {
  console.log('\n====================================');
  console.log(' Server running successfully!');
  console.log('====================================');
  console.log(` Port: ${port}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log( `Health check: http://localhost:${port}/health`);
  console.log(` API root: http://localhost:${port}/`);
  console.log(` Auth: http://localhost:${port}/api/auth/login`);
  console.log('====================================\n');
});
dotenv.config();

const app = express();

// Enhanced CORS for production
app.use(cors({
  origin: [
    'https://peertopeer-platform.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});



// Root route 
app.get('/', (req, res) => {
  res.json({ 
    message: ' Peer to Peer Learning Platform API',
    status: 'RUNNING',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test route for basic API functionality
app.get('/api/test', (req, res) => {
  res.json({ 
    message: ' API is working!',
    endpoint: '/api/test',
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

const createTestUsers = async () => {
  try {
    console.log(' Creating test users...');
    
    // Test Student
    const testStudentEmail = 'student@test.com';
    let student = await User.findOne({ email: testStudentEmail });
    if (!student) {
      const studentHash = await bcrypt.hash('student123', 10);
      student = await User.create({
        name: 'Test Student',
        email: testStudentEmail,
        passwordHash: studentHash,
        password: 'student123',
        role: 'student',
        school: 'Test University',
        reputation: 0,
        badge: 'Newcomer',
        status: 'approved'
      });
      console.log(' Test student created:', testStudentEmail);
    } else {
      console.log(' Test student exists:', testStudentEmail);
    }

    // Test Teacher
    const testTeacherEmail = 'teacher@test.com';
    let teacher = await User.findOne({ email: testTeacherEmail });
    if (!teacher) {
      const teacherHash = await bcrypt.hash('teacher123', 10);
      teacher = await User.create({
        name: 'Test Teacher',
        email: testTeacherEmail,
        passwordHash: teacherHash,
        password: 'teacher123',
        role: 'teacher',
        school: 'Test College',
        reputation: 0,
        badge: 'Teacher',
        status: 'approved'
      });
      console.log(' Test teacher created:', testTeacherEmail);
    } else {
      console.log(' Test teacher exists:', testTeacherEmail);
    }

 
   
    
  } catch (error) {
    console.log(' Could not create test users:', error.message);
  }
};

//  MongoDB connection 
console.log(' Connecting to MongoDB...');
console.log(' Connection URI:', process.env.MONGODB_URI ? 
  process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');


let mongoUri = process.env.MONGODB_URI;
if (mongoUri && !mongoUri.includes('/?') && !mongoUri.match(/\/[^\/\?]+(\?|$)/)) {
  
  const dbName = process.env.DB_NAME || 'p2p-learning';
  mongoUri = mongoUri.endsWith('/') ? mongoUri + dbName : mongoUri + '/' + dbName;
  console.log(' Added database name to URI:', dbName);
}

mongoose.connect(mongoUri || process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'p2p-learning',
 
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    console.log(' MongoDB connected successfully');
    console.log(' Database name:', dbName);
    console.log('Connection state:', mongoose.connection.readyState);
    await upsertAdmin();
    await createTestUsers();
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    console.log(' Continuing without database connection');
  });


app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// to check which database is connected
app.get('/api/db-info', (req, res) => {
  const connection = mongoose.connection;
  res.json({
    connected: connection.readyState === 1,
    database: connection.db?.databaseName || 'Not connected',
    host: connection.host || 'Not connected',
    port: connection.port || 'Not connected',
    name: connection.name || 'Not connected',
    readyState: connection.readyState,
    readyStateText: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[connection.readyState] || 'unknown',
    collections: connection.readyState === 1 ? Object.keys(connection.collections) : []
  });
});

// 404 handler for undefined routes
app.use('/', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      '/', '/health', '/api/test',
      '/api/auth/login', '/api/auth/signup', '/api/auth/me',
      '/api/questions', '/api/answers', '/api/contributors'
    ]
  });
});

app.use((error, req, res, next) => {
  console.error(' Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { 
    origin: [
      'https://peertopeer-platform.netlify.app',
      'http://localhost:5173'
    ]
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return socket.disconnect(true);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const room = `user:${payload.id}`;
    socket.join(room);
    console.log(`User ${payload.id} connected to socket`);
  } catch {
    socket.disconnect(true);
  }
});
// Add MongoDB connection events
mongoose.connection.on('connected', () => {
  const dbName = mongoose.connection.db?.databaseName || 'unknown';
  const host = mongoose.connection.host || 'unknown';
  console.log(' MongoDB connected - Ready for queries');
  console.log(' Active database:', dbName);
  console.log(' Connected to:', host);
  console.log(' Collections:', Object.keys(mongoose.connection.collections).join(', ') || 'None');
});

mongoose.connection.on('error', (err) => {
  console.log(' MongoDB connection error:', err);
  console.log(' Connection URI (masked):', process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');
});

mongoose.connection.on('disconnected', () => {
  console.log(' MongoDB disconnected');
 
});
server.listen(port, () => {
  console.log('\n ====================================');
  console.log(' Server running successfully!');
  console.log(' ====================================');
  console.log(` Port: ${port}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${port}/health`);
  console.log(` API root: http://localhost:${port}/`);
  console.log(' ====================================\n');
});
