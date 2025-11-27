import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

const router = express.Router();

// Get top contributors leaderboard
router.get('/', async (req, res) => {
  try {
    const [questionTotals, answerTotals, students] = await Promise.all([
      Question.aggregate([
        { $match: { author: { $ne: null } } },
        { $group: { _id: '$author', questions: { $sum: 1 } } }
      ]),
      Answer.aggregate([
        { $match: { author: { $ne: null } } },
        { $group: { _id: '$author', answers: { $sum: 1 } } }
      ]),
      User.find({ role: 'student' }).lean()
    ]);

    const statsMap = new Map();
    questionTotals.forEach(({ _id, questions }) => {
      if (!_id) return;
      const key = _id.trim();
      if (!statsMap.has(key)) statsMap.set(key, { questions: 0, answers: 0 });
      statsMap.get(key).questions = questions;
    });
    answerTotals.forEach(({ _id, answers }) => {
      if (!_id) return;
      const key = _id.trim();
      if (!statsMap.has(key)) statsMap.set(key, { questions: 0, answers: 0 });
      statsMap.get(key).answers = answers;
    });

    const contributors = students
      .map((student) => {
        const stats = statsMap.get((student.name || '').trim()) || { questions: 0, answers: 0 };
        const total = stats.questions + stats.answers;
        return {
          id: student._id,
          name: student.name,
          badge: student.badge,
          reputation: student.reputation,
          questions: stats.questions,
          answers: stats.answers,
          total
        };
      })
      .filter((contributor) => contributor.total > 2)
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        if (b.answers !== a.answers) return b.answers - a.answers;
        return b.questions - a.questions;
      })
      .slice(0, 20);

    res.json({ contributors });
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    res.status(500).json({ error: 'Failed to fetch top contributors' });
  }
});

export default router;