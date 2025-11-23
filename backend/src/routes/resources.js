import express from 'express';
import Resource from '../models/Resource.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all approved resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Upload new resource (file URL only for now, no actual file upload)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, subject, fileUrl, fileType } = req.body;
    
    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }
    
    const resource = await Resource.create({
      title,
      description: description || '',
      subject,
      fileUrl: fileUrl || '',
      fileType: fileType || 'document',
      uploadedBy: req.user.id,
      status: 'approved' // Auto-approve for now
    });
    
    res.status(201).json({ 
      resource: {
        id: resource._id,
        title: resource.title,
        subject: resource.subject,
        downloads: resource.downloads,
        rating: resource.rating
      }
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ error: 'Failed to upload resource' });
  }
});

// Download resource (increment counter)
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ ok: true, downloads: resource.downloads });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

export default router;
