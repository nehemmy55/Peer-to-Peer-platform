// User model schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    password: { type: String }, // Store plain text password for admin viewing
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    reputation: { type: Number, default: 0 },
    badge: { type: String, default: 'Newcomer' },
    // add school to store signup info
    school: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
