import React from 'react';

export default function ContributorsPage({ topContributors, questions }) {


  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Top Student Contributors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topContributors.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-blue-600">{c.avatar}</div>
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-gray-600">{c.badge}</p>
            <p className="text-gray-800 font-bold">Reputation: {c.reputation}</p>
          </div>
        ))}
      </div>


    </div>
  );
}
