import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

// API base URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Questions listing page with filtering and voting
export default function QuestionsPage({ questions, selectedSubject, setSelectedSubject, searchQuery, questionsLoading, answersByQuestion, setSelectedQuestion, setShowQuestionDetailModal, user, setQuestions }) {
  const [votingQuestions, setVotingQuestions] = useState(new Set());
  const filteredQuestions = questions
    .filter(q => selectedSubject === 'all' || q.subject === selectedSubject)
    .filter(q => {
      const query = (searchQuery || '').toLowerCase();
      return !query || 
        q.title.toLowerCase().includes(query) || 
        (q.content && q.content.toLowerCase().includes(query));
    });

  // Handle question voting
  const handleVote = async (questionId, action) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    if (votingQuestions.has(questionId)) {
      return;
    }

    setVotingQuestions(prev => new Set(prev).add(questionId));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/questions/${questionId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (!res.ok) {
        throw new Error('Failed to vote');
      }

      const data = await res.json();
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, votes: data.votes } : q
      ));
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setVotingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Questions</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedSubject('all')} className={`px-3 py-2 rounded border ${selectedSubject === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>All</button>
          {['Mathematics','Physics','Chemistry','Biology','History','Literature','Computer Science','Psychology'].map(s => (
            <button key={s} onClick={() => setSelectedSubject(s)} className={`px-3 py-2 rounded border ${selectedSubject === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by title or content..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {questionsLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{q.title}</h3>
                    {q.verified && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>}
                  </div>
                  <p className="text-gray-700 mb-3">{q.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{q.subject}</span>
                    <span>By {q.author}</span>
                    <span>{q.timestamp}</span>
                  </div>
                </div>
                {/* Voting controls */}
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleVote(q.id, 'upvote')}
                      disabled={votingQuestions.has(q.id)}
                      className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Upvote"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className="font-bold min-w-[2rem]">{q.votes || 0}</span>
                    <button 
                      onClick={() => handleVote(q.id, 'downvote')}
                      disabled={votingQuestions.has(q.id)}
                      className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Downvote"
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="mt-2 text-blue-600 hover:underline" onClick={() => { setSelectedQuestion(q); setShowQuestionDetailModal(true); }}>View Answers ({(answersByQuestion[q.id] || []).filter(a => a.status === 'approved').length})</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}