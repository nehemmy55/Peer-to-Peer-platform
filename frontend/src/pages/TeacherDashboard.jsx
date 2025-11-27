import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

export default function TeacherDashboard({
  currentPage,
  setAnswersLoading,
  setAnswersByQuestion,
  questions,
  subjects,
  approveAnswer,
  rejectAnswer,
  answersByQuestion,
  answersLoading,
}) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [textFilter, setTextFilter] = useState('');
  const [modNotice, setModNotice] = useState('');
  const [view, setView] = useState('answers');
  const [allQuestions, setAllQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionStatusFilter, setQuestionStatusFilter] = useState('all');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('all');
  const [questionTextFilter, setQuestionTextFilter] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  // Load questions for moderation
  const loadQuestions = useCallback(async () => {
    if (view !== 'questions') return;
    
    setQuestionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/questions?all=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      setAllQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }, [view, API_BASE]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Load answers with filters
  const loadAnswers = useCallback(async () => {
    if (currentPage !== 'teacher') return;
    
    setAnswersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);

      const response = await fetch(`${API_BASE}/api/answers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const grouped = {};
        const list = Array.isArray(data?.answers) ? data.answers : [];
        
        list.forEach(answer => {
          const qid = String(answer.questionId);
          if (!grouped[qid]) grouped[qid] = [];
          grouped[qid].push({
            id: answer.id || answer._id,
            author: (answer.author && (answer.author.name || answer.author)) || 'Anonymous',
            content: answer.content,
            status: answer.status,
            subject: answer.subject || 'Unknown',
            timestamp: answer.timestamp ? new Date(answer.timestamp).toLocaleString() : '',
            questionTitle: answer.questionTitle || 'Unknown Question'
          });
        });
        
        setAnswersByQuestion(grouped);
      }
    } catch (error) {
      console.error('Failed to load answers:', error);
      setAnswersByQuestion({});
    } finally {
      setAnswersLoading(false);
    }
  }, [currentPage, statusFilter, subjectFilter, setAnswersByQuestion, setAnswersLoading, API_BASE]);

  useEffect(() => { 
    loadAnswers(); 
  }, [loadAnswers]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [API_BASE]);

  const entries = Object.entries(answersByQuestion || {}).flatMap(([qid, list]) => 
    list.map(a => ({ questionId: qid, answer: a }))
  );

  const filtered = entries
    .filter(({ answer }) => statusFilter === 'all' || answer.status === statusFilter)
    .filter(({ questionId, answer }) => {
      const q = questions.find(q => String(q.id) === String(questionId));
      const subj = answer.subject || q?.subject;
      return subjectFilter === 'all' || subj === subjectFilter;
    })
    .filter(({ answer }) => !textFilter || 
      (answer.content + ' ' + answer.author).toLowerCase().includes(textFilter.toLowerCase())
    );

  const pendingCount = entries.filter(({ answer }) => answer.status === 'pending').length;
  const approvedCount = entries.filter(({ answer }) => answer.status === 'approved').length;
  const rejectedCount = entries.filter(({ answer }) => answer.status === 'rejected').length;

  const handleApproveAnswer = async (questionId, answerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/answers/${answerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        approveAnswer(questionId, answerId);
        setModNotice('Answer approved successfully!');
        setTimeout(() => loadAnswers(), 1000);
      } else {
        setModNotice('Failed to approve answer');
      }
    } catch (error) {
      console.error('Error approving answer:', error);
      setModNotice('Failed to approve answer');
    }
    setTimeout(() => setModNotice(''), 3000);
  };

  const handleRejectAnswer = async (questionId, answerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/answers/${answerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        rejectAnswer(questionId, answerId);
        setModNotice('Answer rejected successfully!');
        setTimeout(() => loadAnswers(), 1000);
      } else {
        setModNotice('Failed to reject answer');
      }
    } catch (error) {
      console.error('Error rejecting answer:', error);
      setModNotice('Failed to reject answer');
    }
    setTimeout(() => setModNotice(''), 3000);
  };

  // Handle approve question
  const handleApproveQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/questions/${questionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verified: true })
      });

      if (response.ok) {
        setModNotice('Question approved successfully!');
        setAllQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, verified: true } : q
        ));
        setTimeout(() => loadQuestions(), 1000);
      } else {
        setModNotice('Failed to approve question');
      }
    } catch (error) {
      console.error('Error approving question:', error);
      setModNotice('Failed to approve question');
    }
    setTimeout(() => setModNotice(''), 3000);
  };

  // Handle reject question
  const handleRejectQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/questions/${questionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verified: false })
      });

      if (response.ok) {
        setModNotice('Question rejected successfully!');
        setAllQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, verified: false } : q
        ));
        setTimeout(() => loadQuestions(), 1000);
      } else {
        setModNotice('Failed to reject question');
      }
    } catch (error) {
      console.error('Error rejecting question:', error);
      setModNotice('Failed to reject question');
    }
    setTimeout(() => setModNotice(''), 3000);
  };

  // Filter questions based on status, subject, and text
  const filteredQuestions = allQuestions.filter(q => {
   
    if (questionStatusFilter === 'approved' && !q.verified) return false;
    if (questionStatusFilter === 'pending' && q.verified) return false;
    if (questionStatusFilter === 'rejected' && q.verified) return false; 
  
    if (questionSubjectFilter !== 'all' && q.subject !== questionSubjectFilter) return false;
 
    const authorName = q.author?.name || q.author || '';
    if (questionTextFilter && !(
      (q.title || '').toLowerCase().includes(questionTextFilter.toLowerCase()) ||
      (q.content || '').toLowerCase().includes(questionTextFilter.toLowerCase()) ||
      authorName.toLowerCase().includes(questionTextFilter.toLowerCase())
    )) return false;
    
    return true;
  });

  // Count questions by status
  const questionPendingCount = allQuestions.filter(q => !q.verified).length;
  const questionApprovedCount = allQuestions.filter(q => q.verified).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
            {view === 'answers' ? (
              <>
                <span>Pending: {pendingCount}</span>
                <span className="text-green-700">Approved: {approvedCount}</span>
                <span className="text-red-700">Rejected: {rejectedCount}</span>
              </>
            ) : (
              <>
                <span>Pending: {questionPendingCount}</span>
                <span className="text-green-700">Approved: {questionApprovedCount}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {['answers', 'questions'].map(s => (
              <button 
                key={s} 
                onClick={() => setView(s)} 
                className={`px-3 py-2 rounded border ${
                  view === s 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-bold mb-4">Notifications</h3>
        {notifications.length === 0 ? (
          <div className="text-gray-600">No new notifications.</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div key={notification._id || index} className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {view === 'answers' && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex gap-2">
                {['pending','approved','rejected','all'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setStatusFilter(s)} 
                    className={`px-3 py-2 rounded border text-sm ${
                      statusFilter === s 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div>
                <select 
                  value={subjectFilter} 
                  onChange={(e) => setSubjectFilter(e.target.value)} 
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <input 
                  value={textFilter} 
                  onChange={(e) => setTextFilter(e.target.value)} 
                  placeholder="Search by content or author" 
                  className="w-full px-3 py-2 border rounded" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={loadAnswers} className="bg-gray-100 text-gray-800 px-4 py-2 rounded border hover:bg-gray-200 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${answersLoading ? 'animate-spin' : ''}`} />
                Refresh Answers
              </button>
            </div>
            {answersLoading && (
              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading answers…
              </div>
            )}
            {modNotice && (
              <div className={`mt-3 text-sm p-2 rounded ${
                modNotice.includes('Failed') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {modNotice}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
              <div className="text-lg mb-2">No answers found</div>
              <div className="text-sm">
                Status: <strong>{statusFilter}</strong> | 
                Subject: <strong>{subjectFilter}</strong> | 
                Total Answers: <strong>{entries.length}</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(({ questionId, answer }) => {
                const q = questions.find(q => q.id === questionId);
                return (
                  <div key={`${questionId}-${answer.id}`} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="font-bold text-lg">{q?.title || 'Unknown Question'}</div>
                        <span className="text-sm text-gray-600">{answer.subject}</span>
                      </div>
                      <p className="text-gray-700">{answer.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>By {answer.author}</span>
                        <span>{answer.timestamp}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          answer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          answer.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {answer.status}
                        </span>
                      </div>
                      {answer.status === 'pending' && (
                        <div className="flex items-center gap-3 mt-3">
                          <button 
                            onClick={() => handleApproveAnswer(questionId, answer.id)} 
                            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4" /> Approve
                          </button>
                          <button 
                            onClick={() => handleRejectAnswer(questionId, answer.id)} 
                            className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
                          >
                            <ThumbsDown className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'questions' && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex gap-2">
                {['pending','approved','rejected','all'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setQuestionStatusFilter(s)} 
                    className={`px-3 py-2 rounded border text-sm ${
                      questionStatusFilter === s 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div>
                <select 
                  value={questionSubjectFilter} 
                  onChange={(e) => setQuestionSubjectFilter(e.target.value)} 
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <input 
                  value={questionTextFilter} 
                  onChange={(e) => setQuestionTextFilter(e.target.value)} 
                  placeholder="Search by title, content or author" 
                  className="w-full px-3 py-2 border rounded" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={loadQuestions} className="bg-gray-100 text-gray-800 px-4 py-2 rounded border hover:bg-gray-200 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${questionsLoading ? 'animate-spin' : ''}`} />
                Refresh Questions
              </button>
            </div>
            {questionsLoading && (
              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading questions…
              </div>
            )}
            {modNotice && (
              <div className={`mt-3 text-sm p-2 rounded ${
                modNotice.includes('Failed') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {modNotice}
              </div>
            )}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
              <div className="text-lg mb-2">No questions found</div>
              <div className="text-sm">
                Status: <strong>{questionStatusFilter}</strong> | 
                Subject: <strong>{questionSubjectFilter}</strong> | 
                Total Questions: <strong>{allQuestions.length}</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map(question => {
                const questionId = question.id || question._id;
                const timestamp = question.timestamp || question.createdAt;
                const authorName = question.author?.name || question.author || 'Anonymous';
                let formattedDate = 'Invalid Date';
                try {
                  if (timestamp) {
                    formattedDate = new Date(timestamp).toLocaleString();
                  }
                } catch (e) {
                  formattedDate = 'Invalid Date';
                }
                
                return (
                  <div key={questionId} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="font-bold text-lg">{question.title}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          question.subject === 'Mathematics' ? 'bg-blue-100 text-blue-800' :
                          question.subject === 'Physics' ? 'bg-purple-100 text-purple-800' :
                          question.subject === 'Chemistry' ? 'bg-green-100 text-green-800' :
                          question.subject === 'Biology' ? 'bg-yellow-100 text-yellow-800' :
                          question.subject === 'Computer Science' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {question.subject}
                        </span>
                      </div>
                      <p className="text-gray-700">{question.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>By {authorName}</span>
                        <span>{formattedDate}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          question.verified ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {question.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {!question.verified && (
                          <button 
                            onClick={() => handleApproveQuestion(questionId)} 
                            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4" /> Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleRejectQuestion(questionId)} 
                          className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
                        >
                          <ThumbsDown className="w-4 h-4" /> {question.verified ? 'Unverify' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}