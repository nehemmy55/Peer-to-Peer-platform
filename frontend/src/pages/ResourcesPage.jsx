import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import ResourceUploadModal from '../components/ResourceUploadModal';

export default function ResourcesPage({ bookQuery, setBookQuery, searchBooks, bookLoading, bookError, bookResults, resources, setResources, setShowAuthModal, user, subjects }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const safeBookResults = Array.isArray(bookResults) ? bookResults : [];
  const safeResources = Array.isArray(resources) ? resources : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Shared Resources</h2>
        <button
          onClick={() => user ? setShowUploadModal(true) : setShowAuthModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Resource</span>
        </button>
      </div>

      {showUploadModal && (
        <ResourceUploadModal setShowUploadModal={setShowUploadModal} setResources={setResources} subjects={subjects} />
      )}

      {/* Shared resources grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {safeResources.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl">{r.title}</h3>
                <p className="text-gray-600">Subject: {r.subject}</p>
                <div className="flex items-center space-x-4 text-sm mt-2">
                  <span>Downloads: {r.downloads}</span>
                  <span>Rating: {r.rating}/5</span>
                </div>
              </div>
              <button className="text-blue-600 hover:underline">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}