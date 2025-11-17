import express from 'express';
import Notification from '../models/Notification.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('teacher'), async (req, res) => {
  try {
    const notifications = await Notification.find({ read: false }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/read', requireAuth, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, read: false }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/my/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, userId: req.user.id });
    if (!notif) return res.status(404).json({ error: 'Not found' });
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;