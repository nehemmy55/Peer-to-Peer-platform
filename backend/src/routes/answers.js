import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { status, subject } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  const answers = await Answer.find(filter).sort({ createdAt: -1 }).limit(200);

  let results = answers;
  if (subject && subject !== 'all') {
    const ids = answers.map((a) => a.questionId);
    const qs = await Question.find({ _id: { $in: ids }, subject });
    const allowed = new Set(qs.map((q) => String(q._id)));
    results = answers.filter((a) => allowed.has(String(a.questionId)));
  }

  const normalized = await Promise.all(
    results.map(async (a) => {
      const q = await Question.findById(a.questionId);
      return {
        id: a._id,
        questionId: a.questionId,
        content: a.content,
        author: a.author,
        status: a.status,
        subject: q?.subject || 'Unknown',
        timestamp: a.createdAt
      };
    })
  );
  res.json({ answers: normalized });
});

// Create a new answer
router.post('/', requireAuth, async (req, res) => {
  try {
    const { questionId, content } = req.body || {};
    if (!questionId || !content) {
      return res.status(400).json({ error: 'Missing questionId or content' });
    }

    // Ensure question exists
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Resolve author from authenticated user
    const user = await User.findById(req.user.id).lean();
    const authorName = user?.name || 'Unknown';

    const created = await Answer.create({
      questionId: question._id,
      author: authorName,
      content,
      status: 'pending'
    });

    return res.status(201).json({
      id: created._id,
      questionId: created.questionId,
      content: created.content,
      author: created.author,
      status: created.status,
      timestamp: created.createdAt
    });
  } catch (e) {
    console.error('Create answer error:', e);
    return res.status(500).json({ error: 'Failed to create answer' });
  }
});

router.patch('/:id/status', requireAuth, requireRole('teacher'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { id } = req.params;
  const updated = await Answer.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Answer not found' });
  res.json({ ok: true, status: updated.status });
});

export default router;
