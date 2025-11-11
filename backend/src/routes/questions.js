import Notification from '../models/Notification.js';
import express from 'express';
import User from '../models/User.js'; 
import Question from '../models/Question.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Answer from '../models/Answer.js';



const router = express.Router();

// GET all questions (with optional subject filter)
router.get('/', requireAuth, async (req, res) => {
  const { subject, all } = req.query;
  const filter = subject && subject !== 'all' ? { subject } : {};

  // For admins default to verified-only; non-admins see all
  if (req.user.role === 'admin' && all !== 'true') {
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
});

// Create a new question
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, subject, content } = req.body || {};
    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Missing title, subject, or content' });
    }

    // Get author name from authenticated user
    const user = await User.findById(req.user.id).lean();
    const authorName = user?.name || 'Unknown';

    const created = await Question.create({
      title,
      subject,
      author: authorName,
      content
    });

    // Return normalized shape consistent with GET list
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
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PATCH question status (admin only)
router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
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

export default router;
