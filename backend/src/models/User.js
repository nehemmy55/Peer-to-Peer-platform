import mongoose from 'mongoose';
// Schema for user registration
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    reputation: { type: Number, default: 0 },
    badge: { type: String, default: 'Newcomer' },
    school: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
