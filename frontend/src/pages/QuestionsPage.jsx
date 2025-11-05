import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function QuestionsPage({ questions, selectedSubject, setSelectedSubject, searchQuery, questionsLoading, answersByQuestion, setSelectedQuestion, setShowQuestionDetailModal }) {
  const filteredQuestions = questions
    .filter(q => selectedSubject === 'all' || q.subject === selectedSubject)
    .filter(q => q.title.toLowerCase().includes((searchQuery || '').toLowerCase()));

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
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded"><ThumbsUp className="w-5 h-5" /></button>
                    <span className="font-bold">{q.votes}</span>
                    <button className="p-2 hover:bg-gray-100 rounded"><ThumbsDown className="w-5 h-5" /></button>
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
