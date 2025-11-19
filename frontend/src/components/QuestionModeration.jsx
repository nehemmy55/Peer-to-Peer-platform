import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';



// API base URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Component for moderating questions (teacher view)
export default function QuestionModeration({ questions, setQuestions }) {
  // Update question verification status
  const updateQuestionStatus = (id, verified) => {
    fetch(`${API_BASE}/api/questions/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ verified })
    })
    .then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `HTTP ${r.status}`);
      }
      return r.json();
    })
    .then(() => {
      setQuestions(prev => {
        const updated = prev.map(q => q.id === id ? { ...q, verified } : q);
        localStorage.setItem('questions', JSON.stringify(updated));
        return updated;
      });
    })
    .catch(err => {
      console.error('Failed to update question status:', err);
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="font-bold text-lg">{q.title}</div>
              <span className="text-sm text-gray-600">{q.subject}</span>
            </div>
            <p className="text-gray-700">{q.content}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span>By {q.author}</span>
              <span>{q.timestamp}</span>
              <span className={`text-xs px-2 py-1 rounded ${q.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{q.verified ? 'Verified' : 'Pending'}</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={() => updateQuestionStatus(q.id, true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><ThumbsUp className="w-4 h-4" /> Approve</button>
              <button onClick={() => updateQuestionStatus(q.id, false)} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"><ThumbsDown className="w-4 h-4" /> Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

