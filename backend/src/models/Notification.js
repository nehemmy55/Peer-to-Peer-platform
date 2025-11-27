import mongoose from 'mongoose';

// Schema for user notifications
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['answer_status', 'system'], default: 'system' },
  message: { type: String, required: true },
  meta: { type: Object },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Notification', notificationSchema);