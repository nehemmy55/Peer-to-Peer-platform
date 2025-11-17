import React from 'react';

export default function ContributorsPage({ topContributors = [] }) {
  const highlight = topContributors.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Student Leaders</h2>
        <p className="text-gray-600">
          These students have asked or answered more than two questions. Keep contributing to join the leaderboard!
        </p>
      </div>

      {highlight.length > 0 && (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlight.map((c) => (
            <div key={c.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-blue-700 font-semibold mb-1">Top Performer</p>
              <h3 className="text-xl font-bold text-blue-900">{c.name}</h3>
              <p className="text-sm text-blue-600">{c.badge || 'Dedicated Student'}</p>
              <div className="flex items-center gap-6 mt-4 text-blue-800 font-semibold">
                <span>{c.questions} questions</span>
                <span>{c.answers} answers</span>
              </div>
              <p className="mt-2 text-sm text-blue-700">Total contributions: {c.total}</p>
            </div>
          ))}
        </div>
      )}

      {topContributors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No contributors yet. Encourage students to start asking or answering questions!
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Answers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topContributors.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{c.name}</span>
                      <span className="text-sm text-gray-500">{c.badge || 'Student'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{c.questions}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{c.answers}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
