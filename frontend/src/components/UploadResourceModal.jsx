import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function UploadResourceModal({ subjects, setShowUploadModal, user, setResources }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0] || 'Mathematics');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setShowUploadModal(false);
      return;
    }
    
    setSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          subject, 
          description: description.trim(),
          fileUrl: fileUrl.trim(),
          fileType: 'document'
        }),
      });
      
      if (!res.ok) throw new Error('Failed to upload resource');
      
      const data = await res.json();
      
      // Add to local state
      setResources((prev) => [{
        id: data.resource.id,
        title: data.resource.title,
        subject: data.resource.subject,
        downloads: data.resource.downloads || 0,
        rating: data.resource.rating || 0
      }, ...prev]);
      
      setShowUploadModal(false);
    } catch (err) {
      console.error('Error uploading resource:', err);
      setError('Unable to upload resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Resource
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Calculus Study Guide"
              required 
              className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" 
              disabled={submitting} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" 
              disabled={submitting}
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Brief description of the resource..."
              className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" 
              disabled={submitting} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">File URL (optional)</label>
            <input 
              type="url" 
              value={fileUrl} 
              onChange={(e) => setFileUrl(e.target.value)} 
              placeholder="https://example.com/file.pdf"
              className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" 
              disabled={submitting} 
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to Google Drive, Dropbox, or any public file URL
            </p>
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-6 py-2 border rounded hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
