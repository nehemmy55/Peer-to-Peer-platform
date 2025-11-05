import React from 'react';

export default function SubjectsPage({ subjects, setSelectedSubject, setCurrentPage }) {
  const subjectsList = subjects.length ? subjects : ['Mathematics','Physics','Chemistry','Biology','Computer Science','Economics','History','Literature'];
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Browse by Subject</h2>
      <p className="text-gray-600 mb-6">Explore topics and jump into relevant questions.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {subjectsList.map((s) => (
          <button key={s} onClick={() => { setSelectedSubject(s); setCurrentPage('questions'); }} className="border rounded-lg px-4 py-3 text-left hover:border-blue-500 hover:shadow transition flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-medium">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
