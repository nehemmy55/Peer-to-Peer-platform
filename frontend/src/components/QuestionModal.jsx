import React, { useState } from 'react';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function QuestionModal({ subjects, setShowQuestionModal, setShowAuthModal, user, setQuestions, setAnswersByQuestion }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0] || 'Mathematics');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !details.trim()) {
      setError('Please fill in the title and details.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setShowQuestionModal(false);
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), subject, content: details.trim() }),
      });

      if (!res.ok) throw new Error('Failed to post question');
      const created = await res.json();

      const uiQuestion = {
        id: created.id ?? Date.now(),
        title: created.title ?? title.trim(),
        subject: created.subject ?? subject,
        author: created.author?.name ?? user?.name ?? 'You',
        votes: created.votes ?? 0,
        answers: created.answersCount ?? 0,
        verified: created.verified ?? false,
        timestamp: 'just now',
        content: created.content ?? details.trim(),
      };

      setQuestions(prev => {
        const updated = [uiQuestion, ...prev];
        localStorage.setItem('questions', JSON.stringify(updated));
        return updated;
      });

      setAnswersByQuestion(prev => ({ ...prev, [uiQuestion.id]: [] }));
      setShowQuestionModal(false);

    } catch (err) {
      console.error(err);
      setError('Unable to post your question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button onClick={() => setShowQuestionModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" disabled={submitting} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" disabled={submitting}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea rows="4" value={details} onChange={(e) => setDetails(e.target.value)} className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" disabled={submitting} required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {submitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting...</>) : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
