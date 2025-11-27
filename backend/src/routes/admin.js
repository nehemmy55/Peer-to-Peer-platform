import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users with admin access
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('name email role status').sort({ name: 1 }).limit(500).lean();
    const normalized = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      displayStatus: u.role === 'admin' ? 'Active' : (u.status === 'approved' ? 'Active' : 'Pending'),
    }));
    res.json({ users: normalized });
  } catch (e) {
    console.error('Admin users fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get pending teacher approvals
router.get('/teachers/pending', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'pending' }).sort({ createdAt: -1 }).lean();
    const normalized = teachers.map(t => ({
      id: t._id,
      name: t.name,
      email: t.email,
      school: t.school,
      createdAt: t.createdAt
    }));
    res.json({ teachers: normalized });
  } catch (e) {
    console.error('Pending teachers fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch pending teachers' });
  }
});

// Approve or reject teacher
router.patch('/teachers/:id/:action', requireAuth, requireRole('admin'), async (req, res) => {
  const { id, action } = req.params;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  try {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = await User.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!updated) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json({ message: `Teacher ${action}d successfully`, teacher: updated });
  } catch (e) {
    console.error('Teacher approval error:', e);
    res.status(500).json({ error: 'Failed to process teacher approval' });
  }
});

// Delete user
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const deleted = await User.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    console.error('User deletion error:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;