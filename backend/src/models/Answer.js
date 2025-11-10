import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    author: String,
    content: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model('Answer', answerSchema);
