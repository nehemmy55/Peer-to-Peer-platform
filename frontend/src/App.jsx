import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, LogOut, Menu, MessageCircle, ThumbsDown, ThumbsUp, Upload, Users, X } from 'lucide-react';
import NavBar from './components/NavBar';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import QuestionModal from './components/QuestionModal';
import QuestionDetailModal from './components/QuestionDetailModal';
import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import ResourcesPage from './pages/ResourcesPage';
import ContributorsPage from './pages/ContributorsPage';
import SubjectsPage from './pages/SubjectsPage';
import ManagementPage from './pages/ManagementPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [questions, setQuestions] = useState(() => {
    const cachedQuestions = localStorage.getItem('questions');
    return cachedQuestions ? JSON.parse(cachedQuestions) : [];
  });
  const [resources, setResources] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [showQuestionDetailModal, setShowQuestionDetailModal] = useState(false);
  const [studentNotifications, setStudentNotifications] = useState([]);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Psychology'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data?.user) {
          const avatar = (data.user.name || data.user.email || 'UU').substring(0, 2).toUpperCase();
          setUser({ ...data.user, avatar });
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/contributors', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data?.contributors)) {
          setTopContributors(data.contributors);
        }
      })
      .catch(() => {
        setTopContributors([]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const qs = selectedSubject && selectedSubject !== 'all' ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`/api/questions${qs}`, { 
          signal: controller.signal,
          headers
        });
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        const normalized = (data.questions || []).map((q, idx) => ({
          id: q.id || idx + 1,
          title: q.title,
          subject: q.subject,
          author: q.author,
          votes: q.votes ?? 0,
          answers: q.answers ?? 0,
          verified: !!q.verified,
          timestamp: q.timestamp ? new Date(q.timestamp).toLocaleString() : '',
          content: q.content,
        }));
        setQuestions(normalized);
        localStorage.setItem('questions', JSON.stringify(normalized));
      } catch (e) {
        const cachedQuestions = localStorage.getItem('questions');
        if (cachedQuestions) {
          setQuestions(JSON.parse(cachedQuestions));
        }
      }
    };
    run();
    return () => controller.abort();
  }, [selectedSubject]);

  useEffect(() => {
    if (!user) { setStudentNotifications([]); return; }
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch('/api/notifications/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setStudentNotifications(data.notifications || []);
        }
      } catch {}
    };
    run();
    return () => controller.abort();
  }, [user]);

  const searchBooks = async (query) => {
    if (!query.trim()) {
      setBookResults([]);
      return;
    }
    setBookLoading(true);
    setBookError(null);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
      const data = await res.json();
      setBookResults(data.items || []);
    } catch (err) {
      setBookError('Failed to fetch books');
    } finally {
      setBookLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      const avatar = (data.user.name || data.user.email || 'UU').substring(0, 2).toUpperCase();
      setUser({ ...data.user, avatar });
      if (data.user.role === 'admin') {
        setCurrentPage('admindashboard');
      } else if (data.user.role === 'teacher') {
        setCurrentPage('teacher');
      } else {
        setCurrentPage('home');
      }
      setShowAuthModal(false);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      school: formData.get('school'),
    };
    if (payload.role === 'admin') {
      alert('Admin accounts cannot be created via signup.');
      return;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Signup failed' }));
        throw new Error(errorData.error || 'Signup failed');
      }
      
      const data = await res.json();
      
      if (data.user && data.user.role === 'teacher' && data.user.status === 'pending') {
        alert(data.message || 'Your application is pending admin approval. You will be notified once approved.');
        setShowAuthModal(false);
        return;
      }
      
      if (data.token) localStorage.setItem('token', data.token);
      const avatar = (data.user.name || data.user.email || 'UU').substring(0, 2).toUpperCase();
      setUser({ ...data.user, avatar });

      if (data.user.role === 'teacher') {
        setCurrentPage('teacher');
      } else if (data.user.role === 'admin') {
        setCurrentPage('admindashboard');
      } else {
        setCurrentPage('home');
      }
      setShowAuthModal(false);
    } catch (err) {
      alert('Signup failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('home');
  };

  const approveAnswer = (questionId, answerId) => {
    fetch(`/api/answers/${answerId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: 'approved' })
    })
    .then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `HTTP ${r.status}`);
      }
      return r.json();
    })
    .then(() => {
      setAnswersByQuestion(prev => {
        const updated = { ...prev };
        const list = (updated[questionId] || []).map(a => a.id === answerId ? { ...a, status: 'approved' } : a);
        updated[questionId] = list;
        return updated;
      });
    })
    .catch(err => {
      console.error('Failed to approve answer:', err);
    });
  };

  const rejectAnswer = (questionId, answerId) => {
    fetch(`/api/answers/${answerId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: 'rejected' })
    })
    .then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `HTTP ${r.status}`);
      }
      return r.json();
    })
    .then(() => {
      setAnswersByQuestion(prev => {
        const updated = { ...prev };
        const list = (updated[questionId] || []).map(a => a.id === answerId ? { ...a, status: 'rejected' } : a);
        updated[questionId] = list;
        return updated;
      });
    })
    .catch(err => {
      console.error('Failed to reject answer:', err);
    });
  };

  const markStudentNotifRead = (notificationId) => {
    setStudentNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
        setShowAuthModal={setShowAuthModal}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        answersByQuestion={answersByQuestion}
        approveAnswer={approveAnswer}
        rejectAnswer={rejectAnswer}
        adminNotifications={adminNotifications}
        studentNotifications={studentNotifications}
        markStudentNotifRead={markStudentNotifRead}
      />

      {showAuthModal && (
        <AuthModal
          setShowAuthModal={setShowAuthModal}
          authMode={authMode}
          setAuthMode={setAuthMode}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
        />
      )}

      {currentPage === 'home' && (
        <HomePage
          subjects={subjects}
          setSelectedSubject={setSelectedSubject}
          setCurrentPage={setCurrentPage}
          user={user}
          setShowQuestionModal={setShowQuestionModal}
          setShowAuthModal={setShowAuthModal}
          questions={questions}
          topContributors={topContributors}
        />
      )}

      {currentPage === 'questions' && (
        <QuestionsPage
          questions={questions}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          searchQuery={searchQuery}
          questionsLoading={questionsLoading}
          answersByQuestion={answersByQuestion}
          setSelectedQuestion={setSelectedQuestion}
          setShowQuestionDetailModal={setShowQuestionDetailModal}
          user={user}
          setQuestions={setQuestions}
        />
      )}

      {currentPage === 'resources' && (
        <ResourcesPage
          searchBooks={searchBooks}
          bookResults={bookResults}
          bookLoading={bookLoading}
          bookError={bookError}
          bookQuery={bookQuery}
          setBookQuery={setBookQuery}
        />
      )}

      {currentPage === 'contributors' && (
        <ContributorsPage
          topContributors={topContributors}
        />
      )}

      {currentPage === 'subjects' && (
        <SubjectsPage
          subjects={subjects}
          setSelectedSubject={setSelectedSubject}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'management' && (
        <ManagementPage />
      )}

      {currentPage === 'admindashboard' && (
        <AdminDashboard />
      )}

      {currentPage === 'about' && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-700">
            This platform enables peer-to-peer learning. Admins manage users; teachers moderate answers; students ask and contribute.
          </p>
        </div>
      )}

      {currentPage === 'teacher' && (
        <TeacherDashboard
          currentPage={currentPage}
          questions={questions}
          subjects={subjects}
          answersByQuestion={answersByQuestion}
          answersLoading={answersLoading}
          setAnswersLoading={setAnswersLoading}
          setAnswersByQuestion={setAnswersByQuestion}
          approveAnswer={approveAnswer}
          rejectAnswer={rejectAnswer}
        />
      )}

      {showQuestionModal && (
        <QuestionModal
          subjects={subjects}
          setShowQuestionModal={setShowQuestionModal}
          setShowAuthModal={setShowAuthModal}
          user={user}
          setQuestions={setQuestions}
          setAnswersByQuestion={setAnswersByQuestion}
        />
      )}

      {showQuestionDetailModal && selectedQuestion && (
        <QuestionDetailModal
          selectedQuestion={selectedQuestion}
          answersByQuestion={answersByQuestion}
          setAnswersByQuestion={setAnswersByQuestion}
          user={user}
          setShowQuestionDetailModal={setShowQuestionDetailModal}
          setSelectedQuestion={setSelectedQuestion}
          setShowAuthModal={setShowAuthModal}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;