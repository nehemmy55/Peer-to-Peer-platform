// User model schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    reputation: { type: Number, default: 0 },
    badge: { type: String, default: 'Newcomer' },
    // add school to store signup info
    school: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
