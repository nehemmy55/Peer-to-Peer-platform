import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function ResourceUploadModal({ setShowUploadModal, setResources, subjects }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0] || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return alert('Please provide a title and select a file.');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('subject', subject);

      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setResources(prev => [data, ...prev]); // Add uploaded resource
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6" /> Upload Resource
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select File</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} required className="w-full" />
          </div>

          <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
