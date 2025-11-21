import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ==================== TEACHER NOTIFICATIONS ====================

// Get unread notifications for teachers
router.get('/', requireAuth, requireRole('teacher'), async (req, res) => {
  try {
    const notifications = await Notification.find({ read: false }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read (teacher)
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

// ==================== USER NOTIFICATIONS ====================

// Get current user's notifications
router.get('/my', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, read: false }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark user's notification as read
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

// ==================== ADMIN NOTIFICATIONS ====================

// Get teacher approval notifications for admin
router.get('/admin/teacher-approvals', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      type: 'teacher_approval', 
      read: false 
    }).sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching teacher approvals:', error);
    res.status(500).json({ error: 'Failed to fetch teacher approvals' });
  }
});

// Get pending teachers for admin dashboard
router.get('/admin/pending-teachers', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher', 
      status: 'pending' 
    }).select('name email school createdAt').sort({ createdAt: -1 });
    
    const normalized = teachers.map(t => ({
      id: t._id,
      name: t.name,
      email: t.email,
      school: t.school,
      createdAt: t.createdAt
    }));
    
    res.json({ teachers: normalized });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    res.status(500).json({ error: 'Failed to fetch pending teachers' });
  }
});

// Approve teacher (admin)
router.patch('/admin/teachers/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✅ Approving teacher: ${id}`);
    
    // Update teacher status
    const teacher = await User.findByIdAndUpdate(
      id, 
      { status: 'approved' }, 
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // Mark approval notification as read
    await Notification.updateMany(
      { 'meta.teacherId': id, type: 'teacher_approval' },
      { read: true }
    );
    
    // Create approval notification for the teacher
    await Notification.create({
      userId: id,
      type: 'system',
      message: '🎉 Your teacher application has been approved! You can now access the teacher dashboard.',
      read: false,
      createdAt: new Date()
    });
    
    console.log(`✅ Teacher approved: ${teacher.email}`);
    
    res.json({ 
      message: 'Teacher approved successfully', 
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        status: teacher.status
      }
    });
    
  } catch (error) {
    console.error('Error approving teacher:', error);
    res.status(500).json({ error: 'Failed to approve teacher' });
  }
});

// Reject teacher (admin)
router.patch('/admin/teachers/:id/reject', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`❌ Rejecting teacher: ${id}`);
    
    // Update teacher status
    const teacher = await User.findByIdAndUpdate(
      id, 
      { status: 'rejected' }, 
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // Mark approval notification as read
    await Notification.updateMany(
      { 'meta.teacherId': id, type: 'teacher_approval' },
      { read: true }
    );
    
    // Create rejection notification for the teacher
    await Notification.create({
      userId: id,
      type: 'system', 
      message: 'Your teacher application has been rejected. Please contact support for more information.',
      read: false,
      createdAt: new Date()
    });
    
    console.log(`✅ Teacher rejected: ${teacher.email}`);
    
    res.json({ 
      message: 'Teacher rejected successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        status: teacher.status
      }
    });
    
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    res.status(500).json({ error: 'Failed to reject teacher' });
  }
});

export default router;