import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function QuestionModeration({ questions, setQuestions }) {

  const updateQuestionStatus = async (id, verified) => {
    try {
      const res = await fetch(`${API_BASE}/api/questions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ verified })
      });
      if (!res.ok) throw new Error('Failed to update question status');

      setQuestions(prev => {
        const updated = prev.map(q => q.id === id ? { ...q, verified } : q);
        localStorage.setItem('questions', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update question status.');
    }
  };

  return (
    <div className="space-y-4">
      {questions.map(q => (
        <div key={q.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{q.title}</div>
              <span className="text-sm text-gray-600">{q.subject}</span>
            </div>
            <p className="text-gray-700">{q.content}</p>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>By {q.author}</span>
              <span>{q.timestamp}</span>
              <span className={`text-xs px-2 py-1 rounded ${q.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{q.verified ? 'Verified' : 'Pending'}</span>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => updateQuestionStatus(q.id, true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><ThumbsUp className="w-4 h-4" /> Approve</button>
              <button onClick={() => updateQuestionStatus(q.id, false)} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"><ThumbsDown className="w-4 h-4" /> Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
