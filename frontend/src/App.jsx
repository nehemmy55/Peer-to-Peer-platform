import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Award, MessageCircle, Upload, ThumbsUp, ThumbsDown, X, Menu, LogOut, Bell } from 'lucide-react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [showQuestionDetailModal, setShowQuestionDetailModal] = useState(false);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Psychology'];

  useEffect(() => {
    loadDemoData();
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

  const loadDemoData = () => {
    setTopContributors([
      { id: 1, name: 'Jordan P.', reputation: 2847, badge: 'Math Expert', avatar: 'JP' },
      { id: 2, name: 'Maya S.', reputation: 2156, badge: 'Science Guru', avatar: 'MS' },
      { id: 3, name: 'Chris R.', reputation: 1923, badge: 'Helper', avatar: 'CR' }
    ]);

    setQuestions([
      {
        id: 1,
        title: 'How do I solve quadratic equations?',
        subject: 'Mathematics',
        author: 'Student A',
        votes: 15,
        answers: 3,
        verified: true,
        timestamp: '2 hours ago',
        content: 'I am struggling to understand the quadratic formula and when to use it.'
      },
      {
        id: 2,
        title: 'Explain photosynthesis process',
        subject: 'Biology',
        author: 'Student B',
        votes: 12,
        answers: 5,
        verified: false,
        timestamp: '5 hours ago',
        content: 'Can someone explain the light and dark reactions in detail?'
      },
      {
        id: 3,
        title: 'What caused World War I?',
        subject: 'History',
        author: 'Student C',
        votes: 8,
        answers: 2,
        verified: true,
        timestamp: '1 day ago',
        content: 'Looking for the main causes and trigger events.'
      }
    ]);

    setResources([
      { id: 1, title: 'Calculus Study Guide', subject: 'Mathematics', downloads: 234, rating: 4.8 },
      { id: 2, title: 'Chemistry Past Papers 2024', subject: 'Chemistry', downloads: 189, rating: 4.6 },
      { id: 3, title: 'Physics Formula Sheet', subject: 'Physics', downloads: 312, rating: 4.9 }
    ]);

    // Demo answers for moderation
    setAnswersByQuestion({
      1: [
        { id: 'a1', author: 'Tutor Mike', content: 'Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a.', status: 'approved', timestamp: '1 hour ago' },
        { id: 'a2', author: 'Student Zoe', content: 'You can also factor when possible to find roots quickly.', status: 'pending', timestamp: '30 minutes ago' },
        { id: 'a3', author: 'Teacher Anne', content: 'Complete the square to derive and understand the formula.', status: 'pending', timestamp: '10 minutes ago' },
      ],
      2: [
        { id: 'b1', author: 'Tutor Sam', content: 'Photosynthesis has light-dependent reactions and the Calvin cycle.', status: 'approved', timestamp: '4 hours ago' },
        { id: 'b2', author: 'Student Lee', content: 'Chlorophyll absorbs light in chloroplasts to drive ATP/NADPH.', status: 'pending', timestamp: '2 hours ago' },
      ],
      3: [
        { id: 'c1', author: 'Student Kim', content: 'Assassination of Archduke Franz Ferdinand was the immediate trigger.', status: 'pending', timestamp: '20 hours ago' },
      ],
    });
  };

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
    };
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

  // Fetch questions from backend when subject filter changes
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
      // Update local state optimistically
      setAnswersByQuestion(prev => {
        const updated = { ...prev };
        const list = (updated[questionId] || []).map(a => a.id === answerId ? { ...a, status: 'approved' } : a);
        updated[questionId] = list;
        return updated;
      });
    })
    .catch(err => {
      console.error('Failed to approve answer:', err);
      // Could add error toast here
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
      // Update local state optimistically
      setAnswersByQuestion(prev => {
        const updated = { ...prev };
        const list = (updated[questionId] || []).map(a => a.id === answerId ? { ...a, status: 'rejected' } : a);
        updated[questionId] = list;
        return updated;
      });
    })
    .catch(err => {
      console.error('Failed to reject answer:', err);
      // Could add error toast here
    });
  };

  const NavBar = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const pendingEntries = Object.entries(answersByQuestion)
      .flatMap(([qid, list]) => list.filter(a => a.status === 'pending').map(a => ({ questionId: qid, ...a })));
    const count = pendingEntries.length;
    return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={() => setCurrentPage('home')} className="flex items-center space-x-2 font-bold text-xl">
              <BookOpen className="w-6 h-6" />
              <span>Peer to Peer Platform</span>
            </button>
             <div className="hidden md:flex space-x-6">
               <button onClick={() => setCurrentPage('questions')} className="hover:text-blue-400 transition">Questions</button>
               <button onClick={() => setCurrentPage('resources')} className="hover:text-blue-400 transition">Resources</button>
               {!(user && user.role === 'teacher') && (
                 <>
                   <button onClick={() => setCurrentPage('contributors')} className="hover:text-blue-400 transition">Contributors</button>
                   <button onClick={() => setCurrentPage('subjects')} className="hover:text-blue-400 transition">Subjects</button>
                 </>
               )}
               {/* Teacher nav button removed for teacher role */}
               {user && user.role === 'admin' && (
                 <button onClick={() => setCurrentPage('management')} className="hover:text-blue-400 transition">Management</button>
               )}
             </div>
              <button
                className="md:hidden p-2 rounded hover:bg-gray-800"
                aria-label="Open menu"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
          </div>
        
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-800 rounded-full" aria-label="Notifications" onClick={() => setShowNotifications(v => !v)}>
                    <Bell className="w-5 h-5" />
                  </button>
                  {user.role === 'teacher' && count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {count}
                    </span>
                  )}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded shadow-lg z-50">
                      <div className="px-3 py-2 border-b font-medium">Pending Answers</div>
                      {count === 0 ? (
                        <div className="px-3 py-3 text-sm text-gray-600">No pending answers.</div>
                      ) : (
                        <div className="max-h-64 overflow-auto">
                          {pendingEntries.slice(0, 8).map((a, idx) => (
                            <div key={a.id || idx} className="px-3 py-2 border-b">
                              <div className="text-sm font-medium">{a.author || 'Anonymous'}</div>
                              <div className="text-sm text-gray-700 truncate">{a.content}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    approveAnswer(a.questionId, a.id);
                                    setShowNotifications(false);
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    rejectAnswer(a.questionId, a.id);
                                    setShowNotifications(false);
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total pending: {count}</span>
                        <button className="text-blue-600 text-sm hover:text-blue-700" onClick={() => { setCurrentPage('teacher'); setShowNotifications(false); }}>View Dashboard</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                     {user.avatar}
                   </div>
                   <div className="hidden md:flex flex-col">
                     <span className="text-sm">{user.name}</span>
                     {user.role && (
                       <span className={`text-xs px-2 py-0.5 rounded-full ${
                         user.role === 'admin' ? 'bg-red-100 text-red-800' :
                         user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                         'bg-blue-100 text-blue-800'
                       }`}>
                         {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                       </span>
                     )}
                   </div>
                 </div>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-full"><LogOut className="w-5 h-5" /></button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="px-4 py-2 hover:bg-gray-800 rounded transition">Login</button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">Sign Up</button>
              </>
            )}
          </div>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden border-t border-gray-800 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setCurrentPage('questions'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Questions</button>
              <button onClick={() => { setCurrentPage('resources'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Resources</button>
              {!(user && user.role === 'teacher') && (
                <>
                  <button onClick={() => { setCurrentPage('contributors'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Contributors</button>
                  <button onClick={() => { setCurrentPage('subjects'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Subjects</button>
                </>
              )}
              {user && user.role === 'admin' && (
                <button onClick={() => { setCurrentPage('management'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Management</button>
              )}
              {/* Teacher nav button removed for teacher role (mobile) */}
            </div>
            <div className="flex justify-between pt-2">
              {user ? (
                <button onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="px-3 py-2 bg-gray-800 rounded">Logout</button>
              ) : (
                <>
                  <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); setMobileNavOpen(false); }} className="px-3 py-2 rounded hover:bg-gray-800">Login</button>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); setMobileNavOpen(false); }} className="px-3 py-2 bg-blue-600 rounded">Sign Up</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
        
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Login</button>
            <p className="text-center text-sm">
              Don not have an account? <button type="button" onClick={() => setAuthMode('signup')} className="text-blue-600 hover:underline">Sign up</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input name="name" type="text" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select name="role" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Institution</label>
              <input name="institution" type="text" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Sign Up</button>
            <p className="text-center text-sm">
              Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 hover:underline">Login</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  const HomePage = () => (
    <div>
      <div
        className="relative text-white py-24 px-4"
        style={{
          backgroundImage:
            'linear-gradient(rgba(20,20,20,0.6), rgba(20,20,20,0.6)), url(https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=1500&q=60)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Connect, Learn, Succeed Together</h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of students helping each other succeed. Ask questions, share knowledge, and build your reputation in our collaborative learning community.
          </p>

          {/* Removed hero search bar as requested */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (user ? setShowQuestionModal(true) : setShowAuthModal(true))}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center justify-center space-x-2 shadow"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Ask a Question</span>
            </button>
            <button
              onClick={() => setCurrentPage('questions')}
              className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition flex items-center justify-center space-x-2 shadow"
            >
              <Users className="w-5 h-5" />
              <span>Browse Questions</span>
            </button>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Peer to Peer Platform?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Peer-to-Peer Learning</h3>
              <p className="text-gray-600">Learn from your fellow students who understand your perspective and challenges.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Recognition & Badges</h3>
              <p className="text-gray-600">Build your reputation through helpful answers and earn badges.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Resources</h3>
              <p className="text-gray-600">Access curated notes, study guides, and past papers shared by peers.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Subject</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedSubject(s); setCurrentPage('questions'); }}
                className="px-4 py-2 bg-white border rounded-full hover:bg-gray-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Recent Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...questions].sort((a,b) => b.id - a.id).slice(0, 6).map((q) => (
              <div key={q.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{q.title}</div>
                  {q.verified && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>}
                </div>
                <div className="text-sm text-gray-600 mt-2">{q.subject} • {q.author}</div>
                <button onClick={() => { setSelectedSubject('all'); setCurrentPage('questions'); }} className="mt-3 text-blue-600 hover:underline text-sm">View in Questions</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const QuestionsPage = () => {
    const filteredQuestions = questions
      .filter(q => selectedSubject === 'all' || q.subject === selectedSubject)
      .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Questions</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSubject('all')} className={`px-3 py-2 rounded border ${selectedSubject === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>All</button>
            {subjects.map(s => (
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
                    <button className="mt-2 text-blue-600 hover:underline" onClick={() => {
                      setSelectedQuestion(q);
                      setShowQuestionDetailModal(true);
                    }}>View Answers ({(answersByQuestion[q.id] || []).filter(a => a.status === 'approved').length})</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ResourcesPage = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Shared Resources</h2>
        <button onClick={() => user ? alert('Upload feature coming soon!') : setShowAuthModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Resource</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h3 className="text-xl font-bold mb-3">Search Books</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={bookQuery}
            onChange={(e) => setBookQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') searchBooks(bookQuery); }}
            placeholder="Search books (e.g., Calculus, Biology)"
            className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => searchBooks(bookQuery)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Search</button>
        </div>
        {bookLoading && <p className="mt-3 text-gray-600">Searching books...</p>}
        {bookError && <p className="mt-3 text-red-600">{bookError}</p>}
        {bookResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {bookResults.map((b) => {
              const info = b.volumeInfo || {};
              return (
                <div key={b.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex gap-4">
                    {info.imageLinks?.thumbnail && (
                      <img src={info.imageLinks.thumbnail} alt={info.title} className="w-16 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{info.title}</div>
                      <div className="text-sm text-gray-600">{(info.authors || []).join(', ')}</div>
                      <div className="mt-2 flex gap-2">
                        {info.previewLink && <a href={info.previewLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Preview</a>}
                        {info.infoLink && <a href={info.infoLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Details</a>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {resources.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl">{r.title}</h3>
                <p className="text-gray-600">Subject: {r.subject}</p>
                <div className="flex items-center space-x-4 text-sm mt-2">
                  <span>Downloads: {r.downloads}</span>
                  <span>Rating: {r.rating}/5</span>
                </div>
              </div>
              <button className="text-blue-600 hover:underline">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContributorsPage = () => {
    const participantCounts = questions.reduce((acc, q) => {
      acc[q.author] = (acc[q.author] || 0) + 1;
      return acc;
    }, {});
    const participants = Object.entries(participantCounts).map(([name, count], idx) => ({ id: idx + 1, name, count }));

    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Top Contributors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topContributors.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-blue-600">
                {c.avatar}
              </div>
              <h3 className="font-bold">{c.name}</h3>
              <p className="text-gray-600">{c.badge}</p>
              <p className="text-gray-800 font-bold">Reputation: {c.reputation}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6">Participants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {participants.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-gray-600">Questions Participated: {p.count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SubjectsPage = () => {
    const subjectsList = subjects.length ? subjects : [
      'Mathematics','Physics','Chemistry','Biology','Computer Science','Economics','History','Literature'
    ];
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse by Subject</h2>
        <p className="text-gray-600 mb-6">Explore topics and jump into relevant questions.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subjectsList.map((s) => (
            <button
              key={s}
              onClick={() => { setSelectedSubject(s); setCurrentPage('questions'); }}
              className="border rounded-lg px-4 py-3 text-left hover:border-blue-500 hover:shadow transition flex items-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-medium">{s}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ManagementPage = () => (
     <div className="container mx-auto px-4 py-8">
       <h2 className="text-2xl font-bold mb-6">Admin Management</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-xl font-bold mb-4">User Management</h3>
           <div className="space-y-2">
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">View All Users</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Manage Roles</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Suspend Users</button>
           </div>
         </div>
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-xl font-bold mb-4">Content Moderation</h3>
           <div className="space-y-2">
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Review Flagged Questions</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Moderate Resources</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Verify Answers</button>
           </div>
         </div>
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-xl font-bold mb-4">Platform Analytics</h3>
           <div className="space-y-2">
             <div className="p-3 bg-blue-50 rounded">Total Users: 1,247</div>
             <div className="p-3 bg-green-50 rounded">Active Questions: 89</div>
             <div className="p-3 bg-purple-50 rounded">Resources Shared: 156</div>
           </div>
         </div>
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="text-xl font-bold mb-4">System Settings</h3>
           <div className="space-y-2">
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Platform Configuration</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Notification Settings</button>
             <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Backup & Maintenance</button>
           </div>
         </div>
       </div>
     </div>
   );


  const QuestionModal = () => {
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
        const res = await fetch('/api/questions', {
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
        setQuestions((prev) => [uiQuestion, ...prev]);
        setAnswersByQuestion((prev) => ({ ...prev, [uiQuestion.id]: [] }));
        setShowQuestionModal(false);
        // Keep user on Home or Questions page; recent section will reflect immediately
      } catch (err) {
        console.error('Error posting question:', err);
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
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea
                rows="4"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
                required
              ></textarea>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const QuestionDetailModal = () => {
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    
    if (!selectedQuestion) return null;
    
    const questionAnswers = answersByQuestion[selectedQuestion.id] || [];
    const approvedAnswers = questionAnswers.filter(a => a.status === 'approved');
    
    const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyContent.trim() || !user) return;
      
      setReplyLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/answers', {
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
        
        if (response.ok) {
          const newAnswer = await response.json();
          // Add the new answer to local state (optimistic update)
          setAnswersByQuestion(prev => ({
            ...prev,
            [selectedQuestion.id]: [
              ...(prev[selectedQuestion.id] || []),
              {
                id: newAnswer.id || `temp-${Date.now()}`,
                author: user.name,
                content: replyContent.trim(),
                status: 'pending',
                timestamp: 'just now'
              }
            ]
          }));
          setReplyContent('');
          alert('Your answer has been submitted and is pending approval!');
        } else {
          throw new Error('Failed to submit answer');
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Failed to submit answer. Please try again.');
      } finally {
        setReplyLoading(false);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
          <button onClick={() => {
            setShowQuestionDetailModal(false);
            setSelectedQuestion(null);
          }} className="absolute top-4 right-4 z-10">
            <X className="w-6 h-6" />
          </button>
          
          {/* Question Details */}
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
          
          {/* Answers Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">
              Answers ({approvedAnswers.length})
            </h3>
            
            {approvedAnswers.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                No approved answers yet. Be the first to help!
              </div>
            ) : (
              <div className="space-y-4">
                {approvedAnswers.map((answer) => (
                  <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 mb-3">{answer.content}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>By {answer.author}</span>
                      <span>{answer.timestamp}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Approved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Reply Form */}
          {user ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Your Answer</h3>
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <div>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your knowledge and help others learn..."
                    rows="4"
                    required
                    className="w-full px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={replyLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Your answer will be reviewed before being published.
                  </p>
                  <button
                    type="submit"
                    disabled={replyLoading || !replyContent.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {replyLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t pt-6 text-center">
              <p className="text-gray-600 mb-4">Please log in to answer this question.</p>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setShowAuthModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm">© {new Date().getFullYear()} Peer to Peer Platform</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar />

      <main className="flex-1">
         {currentPage === 'home' && <HomePage />}
         {currentPage === 'questions' && <QuestionsPage />}
         {currentPage === 'resources' && <ResourcesPage />}
       {currentPage === 'contributors' && <ContributorsPage />}
        {currentPage === 'subjects' && <SubjectsPage />}
        {currentPage === 'management' && user && user.role === 'admin' && <ManagementPage />}
        {/* Tutoring route removed */}
        {currentPage === 'teacher' && user && user.role === 'teacher' && <TeacherDashboard />}
        </main>

      <Footer />

      {showAuthModal && <AuthModal />}
      {showQuestionModal && <QuestionModal />}
      {showQuestionDetailModal && <QuestionDetailModal />}
    </div>
  );
};

export default App;


  const TeacherDashboard = () => {
    const [statusFilter, setStatusFilter] = useState('pending');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [textFilter, setTextFilter] = useState('');
    const [modNotice, setModNotice] = useState('');

    // Helper to load answers from backend
    const loadAnswers = React.useCallback(() => {
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
          // Keep demo data if backend fails
          console.log('Using demo answers data');
        })
        .finally(() => setAnswersLoading(false));
    }, [currentPage, statusFilter, subjectFilter]);

    // Fetch answers when filters change
    useEffect(() => {
      loadAnswers();
    }, [loadAnswers]);

    const entries = Object.entries(answersByQuestion)
      .flatMap(([qid, list]) => list.map(a => ({ questionId: qid, answer: a })));

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
      filtered
        .filter(({ answer }) => answer.status === 'pending')
        .forEach(({ questionId, answer }) => approveAnswer(questionId, answer.id));
      setModNotice('Approved pending answers locally. Click Refresh to sync.');
      setTimeout(() => setModNotice(''), 2500);
    };

    const bulkReject = () => {
      filtered
        .filter(({ answer }) => answer.status === 'pending')
        .forEach(({ questionId, answer }) => rejectAnswer(questionId, answer.id));
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex gap-2">
              {['pending','approved','rejected','all'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
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
          {answersLoading && (
            <div className="mt-3 text-sm text-gray-600">Loading answers…</div>
          )}
          {modNotice && (
            <div className="mt-3 text-sm text-blue-700">{modNotice}</div>
          )}
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
                      <button onClick={() => approveAnswer(questionId, answer.id)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                        <ThumbsUp className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => rejectAnswer(questionId, answer.id)} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700">
                        <ThumbsDown className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
