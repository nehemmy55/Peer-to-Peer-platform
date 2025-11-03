import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { subject } = req.query;
  const filter = subject && subject !== 'all' ? { subject } : {};
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

export default router;
