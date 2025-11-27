import React, { useState } from 'react';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function QuestionDetailModal({ selectedQuestion, answersByQuestion, setAnswersByQuestion, user, setShowQuestionDetailModal, setSelectedQuestion, setShowAuthModal }) {
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!selectedQuestion) return null;

  const questionAnswers = answersByQuestion[selectedQuestion.id] || [];
  const approvedAnswers = questionAnswers.filter(a => a.status === 'approved');
  const myLatestAnswer = user ? [...questionAnswers].reverse().find(a => a.author === user.name) : null;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) {
      if (!user) {
        setShowQuestionDetailModal(false);
        setShowAuthModal(true);
      }
      return;
    }

    setReplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          content: replyContent.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      const newAnswer = await response.json();

      setAnswersByQuestion(prev => ({
        ...prev,
        [selectedQuestion.id]: [
          ...(prev[selectedQuestion.id] || []),
          {
            id: newAnswer.id ?? `temp-${Date.now()}`,
            author: user.name,
            content: replyContent.trim(),
            status: 'pending',
            timestamp: 'just now'
          }
        ]
      }));

      setReplyContent('');
      alert('Your answer has been submitted and is pending approval!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={() => { setShowQuestionDetailModal(false); setSelectedQuestion(null); }} className="absolute top-4 right-4 z-10">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold pr-8">{selectedQuestion.title}</h2>
            {selectedQuestion.verified && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Verified</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedQuestion.subject}</span>
            <span>Asked by {selectedQuestion.author}</span>
            <span>{selectedQuestion.timestamp}</span>
            <span>{selectedQuestion.votes} votes</span>
          </div>
          <p className="text-gray-700 mb-4">{selectedQuestion.content}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Answers ({approvedAnswers.length})</h3>
          {approvedAnswers.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">No approved answers yet. Be the first to help!</div>
          ) : (
            <div className="space-y-4">
              {approvedAnswers.map(a => (
                <div key={a.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 mb-3">{a.content}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>By {a.author}</span>
                    <span>{a.timestamp}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Your Answer</h3>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Share your knowledge..." rows="4" required className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" disabled={replyLoading} />
              <button type="submit" disabled={replyLoading || !replyContent.trim()} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{replyLoading ? 'Submitting...' : 'Submit Answer'}</button>
            </form>
          </div>
        ) : (
          <div className="border-t pt-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to answer this question.</p>
            <button onClick={() => { setSelectedQuestion(null); setShowQuestionDetailModal(false); setShowAuthModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Log In</button>
          </div>
        )}
      </div>
    </div>
  );
}
