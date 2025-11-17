import React from 'react';
import { Upload } from 'lucide-react';

// Resources page for books and study materials
export default function ResourcesPage({ bookQuery, setBookQuery, searchBooks, bookLoading, bookError, bookResults, resources, setShowAuthModal, user }) {
  const safeBookResults = Array.isArray(bookResults) ? bookResults : [];
  const safeResources = Array.isArray(resources) ? resources : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Shared Resources</h2>
        <button onClick={() => user ? alert('Upload feature coming soon!') : setShowAuthModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Resource</span>
        </button>
      </div>

      {/* Book search section */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h3 className="text-xl font-bold mb-3">Search Books</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchBooks(bookQuery); }} placeholder="Search books (e.g., Calculus, Biology)" className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => searchBooks(bookQuery)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Search</button>
        </div>
        {bookLoading && <p className="mt-3 text-gray-600">Searching books...</p>}
        {bookError && <p className="mt-3 text-red-600">{bookError}</p>}
        {/* Book results grid */}
        {safeBookResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {safeBookResults.map((b) => {
              const info = b.volumeInfo || {};
              return (
                <div key={b.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex gap-4">
                    {info.imageLinks?.thumbnail && (
                      <img src={info.imageLinks.thumbnail} alt={info.title} className="w-16 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{info.title}</div>
                      <div className="text-sm text-gray-600">{(info.authors || []).join(', ')}</div>
                      <div className="mt-2 flex gap-2">
                        {info.previewLink && <a href={info.previewLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Preview</a>}
                        {info.infoLink && <a href={info.infoLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Details</a>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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