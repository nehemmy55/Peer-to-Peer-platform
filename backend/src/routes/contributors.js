import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const topContributors = await User.find({ role: 'student' })
      .sort({ reputation: -1 })
      .limit(10);

    const contributors = await Promise.all(
      topContributors.map(async (user) => {
        const questionsCount = await Question.countDocuments({ author: user.name });
        const answersCount = await Answer.countDocuments({ author: user.name });

        return {
          id: user._id,
          name: user.name,
          reputation: user.reputation,
          badge: user.badge,
          questions: questionsCount,
          answers: answersCount,
        };
      })
    );

    res.json({ contributors });
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    res.status(500).json({ error: 'Failed to fetch top contributors' });
  }
});

export default router;