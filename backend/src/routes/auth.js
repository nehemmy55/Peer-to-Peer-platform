import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Check if teacher is pending approval
    if (user.role === 'teacher' && user.status === 'pending') {
      return res.status(403).json({ 
        error: 'Your teacher account is pending approval. Please wait for admin approval.',
        status: 'pending'
      });
    }
    
    // Check if teacher/student was rejected
    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Your account application was rejected. Please contact support.',
        status: 'rejected'
      });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        badge: user.badge, 
        status: user.status 
      } 
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const user = await User.findById(decoded.id).select('-passwordHash -password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        badge: user.badge, 
        status: user.status 
      } 
    });
  } catch (e) {
    console.error('Get user error:', e);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { name, email, password, role, school } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const badge = role === 'teacher' ? 'Teacher' : 'Newcomer';
    const status = role === 'teacher' ? 'pending' : 'approved';
    
    const user = await User.create({ 
      name, 
      email, 
      passwordHash, 
      password, 
      role, 
      school, 
      reputation: 0, 
      badge, 
      status 
    });
    
    // CREATE NOTIFICATION FOR ADMIN WHEN TEACHER SIGNS UP
    if (role === 'teacher') {
      try {
        await Notification.create({
          type: 'teacher_approval',
          message: `New teacher application from ${name} (${school})`,
          meta: {
            teacherId: user._id,
            teacherName: name,
            teacherEmail: email,
            school: school,
            createdAt: new Date()
          },
          read: false,
          createdAt: new Date()
        });
        
        console.log(`✅ Teacher approval notification created for: ${name}`);
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Continue even if notification fails
      }
    }
    
    if (role === 'teacher' && status === 'pending') {
      return res.json({ 
        message: 'Your application is pending admin approval. You will be notified once approved.',
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          badge: user.badge, 
          status: user.status 
        }
      });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        badge: user.badge, 
        status: user.status 
      } 
    });
    
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

export default router;
