import Notification from '../models/Notification.js';
import express from 'express';
import User from '../models/User.js'; 
import Question from '../models/Question.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Answer from '../models/Answer.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to get user from token
const getUserFromToken = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const user = await User.findById(decoded.id).lean();
    return user;
  } catch {
    return null;
  }
};

// Get questions with filtering
router.get('/', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.warn('Database not connected, returning empty questions');
      return res.json({ questions: [] });
    }

    const { subject, all } = req.query;
    
    // Get user role if authenticated
    const user = await getUserFromToken(req);
    const userRole = user?.role;

    // Build filter
    const filter = {};
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    
    // For non-admin and non-teacher users, only show verified questions
    if (userRole !== 'admin' && userRole !== 'teacher') {
      filter.verified = true;
    }

    const items = await Question.find(filter).sort({ createdAt: -1 }).limit(100);
    const withCounts = await Promise.all(
      items.map(async (q) => {
        const count = await Answer.countDocuments({ questionId: q._id, status: 'approved' });
        return {
          id: q._id,
          title: q.title,
          subject: q.subject,
          author: q.author,
          content: q.content,
          votes: q.votes || 0,
          verified: q.verified,
          answers: count,
          timestamp: q.createdAt
        };
      })
    );
    res.json({ questions: withCounts });
  } catch (e) {
    console.error('Get questions error:', e);
    res.status(500).json({ error: 'Failed to fetch questions', questions: [] });
  }
});

// Create new question
router.post('/', requireAuth, async (req, res) => {
  try {
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const dbName = mongoose.connection.db?.databaseName;
    console.log(' Creating question in database:', dbName);

    const { title, subject, content } = req.body || {};
    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Missing title, subject, or content' });
    }

    const user = await User.findById(req.user.id).lean();
    const authorName = user?.name || 'Unknown';

    const created = await Question.create({
      title,
      subject,
      author: authorName,
      content
    });

    console.log(' Question created with ID:', created._id);
    console.log(' Saved to database:', dbName);
    console.log(' Collection: questions');

    res.status(201).json({
      id: created._id,
      title: created.title,
      subject: created.subject,
      author: created.author,
      content: created.content,
      votes: created.votes || 0,
      verified: created.verified,
      answers: 0,
      timestamp: created.createdAt
    });
  } catch (e) {
    console.error('Create question error:', e);
    console.error('Database:', mongoose.connection.db?.databaseName);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question verification status
router.patch('/:id/status', requireAuth, requireRole('teacher'), async (req, res) => {
  const { verified } = req.body;
  if (typeof verified !== 'boolean') {
    return res.status(400).json({ error: 'Invalid verified status' });
  }
  const { id } = req.params;
  const updated = await Question.findByIdAndUpdate(id, { verified }, { new: true });
  if (!updated) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ ok: true, verified: updated.verified });
});

// Vote on question
router.patch('/:id/vote', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  
  if (!['upvote', 'downvote'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use "upvote" or "downvote"' });
  }
  
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    if (action === 'upvote') {
      question.votes = (question.votes || 0) + 1;
    } else {
      question.votes = Math.max(0, (question.votes || 0) - 1);
    }
    
    await question.save();
    
    res.json({ 
      ok: true, 
      votes: question.votes 
    });
  } catch (e) {
    console.error('Vote error:', e);
    res.status(500).json({ error: 'Failed to update vote' });
  }
});

export default router;