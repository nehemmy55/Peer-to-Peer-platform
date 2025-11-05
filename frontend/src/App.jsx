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

// Update signup payload to include school; fix admin redirect to management
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
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

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Psychology'];

  useEffect(() => {

  }, []);

  // Hydrate user from JWT on app load
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
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      const avatar = (data.user.name || data.user.email || 'UU').substring(0, 2).toUpperCase();
      setUser({ ...data.user, avatar });
      // redirect based on role
      if (data.user.role === 'admin') {
        setCurrentPage('admindashboard');
      } else if (data.user.role === 'teacher') {
        setCurrentPage('teacher');
      } else {
        setCurrentPage('studentdashboard');
      }
      setShowAuthModal(false);
    } catch (err) {
      alert('Invalid credentials');
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
    // Prevent admin signup per your requirement
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
      if (!res.ok) throw new Error('Signup failed');
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      const avatar = (data.user.name || data.user.email || 'UU').substring(0, 2).toUpperCase();
      setUser({ ...data.user, avatar });

      // Notify admin if a teacher signed up
      if (data.user.role === 'teacher') {
        setAdminNotifications((prev) => [
          ...prev,
          { type: 'teacher_signup', email: data.user.email, time: new Date().toISOString() },
        ]);
        setCurrentPage('teacher');
      } else {
        // student
        setCurrentPage('studentdashboard');
      }
      setShowAuthModal(false);
    } catch (err) {
      alert('Signup failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('home');
  };

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const qs = selectedSubject && selectedSubject !== 'all' ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
        const res = await fetch(`/api/questions${qs}`, { signal: controller.signal });
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
      } catch (e) {
        // keep demo if backend not ready
      }
    };
    run();
    return () => controller.abort();
  }, [selectedSubject]);

  const approveAnswer = (questionId, answerId) => {
    fetch(`/api/answers/${answerId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: 'approved' })
    })
    .then(r => r.ok ? r.json() : Promise.reject())
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
    .then(r => r.ok ? r.json() : Promise.reject())
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
        />
      )}

      {currentPage === 'resources' && (
        <ResourcesPage
          bookQuery={bookQuery}
          setBookQuery={setBookQuery}
          searchBooks={searchBooks}
          bookLoading={bookLoading}
          bookError={bookError}
          bookResults={bookResults}
          resources={resources}
          setShowAuthModal={setShowAuthModal}
          user={user}
        />
      )}

      {currentPage === 'contributors' && (
        <ContributorsPage
          topContributors={topContributors}
          questions={questions}
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
          questions={questions}
          answersByQuestion={answersByQuestion}
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
          question={selectedQuestion}
          setShowQuestionDetailModal={setShowQuestionDetailModal}
          answers={answersByQuestion[selectedQuestion.id] || []}
          user={user}
          setShowAuthModal={setShowAuthModal}
          answersLoading={answersLoading}
        />
      )}
    </div>
  );
};

export default App;