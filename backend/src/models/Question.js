import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: String,
    subject: String,
    author: String,
    content: String,
    verified: { type: Boolean, default: false },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
