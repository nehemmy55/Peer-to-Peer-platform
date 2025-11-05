import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import questionsRouter from './routes/questions.js';
import answersRouter from './routes/answers.js';
import contributorsRouter from './routes/contributors.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/notifications', notificationsRouter);

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
