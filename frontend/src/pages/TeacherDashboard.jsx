import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import QuestionModeration from '../components/QuestionModeration';

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

  useEffect(() => {
    if (view !== 'questions') return;
    fetch('/api/questions?all=true', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      setAllQuestions(data.questions || []);
    })
    .catch(() => {
      console.log('Failed to load all questions');
    });
  }, [view]);

  const loadAnswers = useCallback(() => {
    if (currentPage !== 'teacher') return;
    setAnswersLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (subjectFilter !== 'all') params.append('subject', subjectFilter);

    fetch(`/api/answers?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
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
            timestamp: answer.timestamp ? new Date(answer.timestamp).toLocaleString() : ''
          });
        });
        setAnswersByQuestion(grouped);
      })
      .catch(() => {
        console.log('Using demo answers data');
      })
      .finally(() => setAnswersLoading(false));
  }, [currentPage, statusFilter, subjectFilter, setAnswersByQuestion, setAnswersLoading]);

  useEffect(() => { loadAnswers(); }, [loadAnswers]);

  useEffect(() => {
    fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      setNotifications(data.notifications || []);
    })
    .catch(() => {
      console.log('Failed to load notifications');
    });
  }, []);

  const entries = Object.entries(answersByQuestion || {}).flatMap(([qid, list]) => list.map(a => ({ questionId: qid, answer: a })));

  const filtered = entries
    .filter(({ answer }) => statusFilter === 'all' || answer.status === statusFilter)
    .filter(({ questionId, answer }) => {
      const q = questions.find(q => String(q.id) === String(questionId));
      const subj = answer.subject || q?.subject;
      return subjectFilter === 'all' || subj === subjectFilter;
    })
    .filter(({ answer }) => !textFilter || (answer.content + ' ' + answer.author).toLowerCase().includes(textFilter.toLowerCase()));

  const pendingCount = entries.filter(({ answer }) => answer.status === 'pending').length;
  const approvedCount = entries.filter(({ answer }) => answer.status === 'approved').length;
  const rejectedCount = entries.filter(({ answer }) => answer.status === 'rejected').length;

  const bulkApprove = () => {
    filtered.filter(({ answer }) => answer.status === 'pending').forEach(({ questionId, answer }) => approveAnswer(questionId, answer.id));
    setModNotice('Approved pending answers locally. Click Refresh to sync.');
    setTimeout(() => setModNotice(''), 2500);
  };

  const bulkReject = () => {
    filtered.filter(({ answer }) => answer.status === 'pending').forEach(({ questionId, answer }) => rejectAnswer(questionId, answer.id));
    setModNotice('Rejected pending answers locally. Click Refresh to sync.');
    setTimeout(() => setModNotice(''), 2500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
          <span>Pending: {pendingCount}</span>
          <span className="text-green-700">Approved: {approvedCount}</span>
          <span className="text-red-700">Rejected: {rejectedCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-bold mb-4">Notifications</h3>
        {notifications.length === 0 ? (
          <div className="text-gray-600">No new notifications.</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification._id} className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex gap-2">
            {['answers', 'questions'].map(s => (
              <button key={s} onClick={() => setView(s)} className={`px-3 py-2 rounded border ${view === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
          <div>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <input value={textFilter} onChange={(e) => setTextFilter(e.target.value)} placeholder="Search by content or author" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={bulkApprove} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve All Pending (Filtered)</button>
          <button onClick={bulkReject} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject All Pending (Filtered)</button>
          <button onClick={loadAnswers} className="bg-gray-100 text-gray-800 px-4 py-2 rounded border hover:bg-gray-200">Refresh</button>
        </div>
        {answersLoading && (<div className="mt-3 text-sm text-gray-600">Loading answers…</div>)}
        {modNotice && (<div className="mt-3 text-sm text-blue-700">{modNotice}</div>)}
      </div>

      {view === 'answers' && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex gap-2">
                {['pending','approved','rejected','all'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
              <div>
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <input value={textFilter} onChange={(e) => setTextFilter(e.target.value)} placeholder="Search by content or author" className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={bulkApprove} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve All Pending (Filtered)</button>
              <button onClick={bulkReject} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject All Pending (Filtered)</button>
              <button onClick={loadAnswers} className="bg-gray-100 text-gray-800 px-4 py-2 rounded border hover:bg-gray-200">Refresh</button>
            </div>
            {answersLoading && (<div className="mt-3 text-sm text-gray-600">Loading answers…</div>)}
            {modNotice && (<div className="mt-3 text-sm text-blue-700">{modNotice}</div>)}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">No answers match current filters.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(({ questionId, answer }) => {
                const q = questions.find(q => q.id === questionId);
                return (
                  <div key={`${questionId}-${answer.id}`} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="font-bold text-lg">{q?.title}</div>
                        <span className="text-sm text-gray-600">{q?.subject}</span>
                      </div>
                      <p className="text-gray-700">{answer.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>By {answer.author}</span>
                        <span>{answer.timestamp}</span>
                        <span className={`text-xs px-2 py-1 rounded ${answer.status === 'approved' ? 'bg-green-100 text-green-800' : answer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{answer.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => approveAnswer(questionId, answer.id)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><ThumbsUp className="w-4 h-4" /> Approve</button>
                        <button onClick={() => rejectAnswer(questionId, answer.id)} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"><ThumbsDown className="w-4 h-4" /> Reject</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'questions' && (
        <QuestionModeration questions={allQuestions} setQuestions={setAllQuestions} />
      )}
    </div>
  );
}