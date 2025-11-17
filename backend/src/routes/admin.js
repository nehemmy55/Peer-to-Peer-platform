import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET users list for admin table
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Explicitly select all fields including password (plain text)
    const users = await User.find({}).select('name email role status password updatedAt createdAt').sort({ name: 1 }).limit(500).lean();
    const normalized = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastPayment: (u.updatedAt || u.createdAt),
      displayStatus: u.role === 'admin' ? 'Active' : (u.status === 'approved' ? 'Active' : 'Pending'),
      password: u.password || 'N/A',
    }));
    res.json({ users: normalized });
  } catch (e) {
    console.error('Admin users fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET pending teachers for approval
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

// APPROVE/REJECT teacher
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

// DELETE user
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