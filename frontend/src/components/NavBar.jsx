import React, { useState } from 'react';
import { BookOpen, Menu, Bell, LogOut } from 'lucide-react';

export default function NavBar({
  approveAnswer,
  rejectAnswer,
  answersByQuestion,
  setCurrentPage,
  setShowAuthModal,
  setAuthMode,
  user,
  handleLogout,
  adminNotifications,
  studentNotifications,
  markStudentNotifRead,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const pendingEntries = Object.entries(answersByQuestion || {})
    .flatMap(([qid, list]) => (list || []).filter(a => a.status === 'pending').map(a => ({ questionId: qid, ...a })));
  const teacherPendingCount = pendingEntries.length;
  const adminNotifCount = (adminNotifications || []).length;
  const studentNotifCount = (studentNotifications || []).length;

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
              <button onClick={() => (user ? setCurrentPage('questions') : setShowAuthModal(true))} className="hover:text-blue-400 transition">Questions</button>
              <button onClick={() => (user ? setCurrentPage('resources') : setShowAuthModal(true))} className="hover:text-blue-400 transition">Resources</button>
              {!(user && user.role === 'teacher') && (
                <>
                  <button onClick={() => (user ? setCurrentPage('contributors') : setShowAuthModal(true))} className="hover:text-blue-400 transition">Contributors</button>
              <button onClick={() => (user ? setCurrentPage('subjects') : setShowAuthModal(true))} className="hover:text-blue-400 transition">Subjects</button>
                </>
              )}
              {user && user.role === 'admin' && (
                <button onClick={() => setCurrentPage('admindashboard')} className="hover:text-blue-400 transition">Admin Dashboard</button>
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
                  {/* badges */}
                  {user.role === 'teacher' && teacherPendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {teacherPendingCount}
                    </span>
                  )}
                  {user.role === 'admin' && adminNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {adminNotifCount}
                    </span>
                  )}
                  {user.role === 'student' && studentNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {studentNotifCount}
                    </span>
                  )}

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded shadow-lg z-50">
                      {user.role === 'teacher' ? (
                        <>
                          <div className="px-3 py-2 border-b font-medium">Pending Answers</div>
                          {teacherPendingCount === 0 ? (
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
                                      onClick={(e) => { e.stopPropagation(); approveAnswer(a.questionId, a.id); setShowNotifications(false); }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                      onClick={(e) => { e.stopPropagation(); rejectAnswer(a.questionId, a.id); setShowNotifications(false); }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-xs text-gray-600">Total pending: {teacherPendingCount}</span>
                            <button className="text-blue-600 text-sm hover:text-blue-700" onClick={() => { setCurrentPage('teacher'); setShowNotifications(false); }}>View Dashboard</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-3 py-2 border-b font-medium">Admin Notifications</div>
                          {adminNotifCount === 0 ? (
                            <div className="px-3 py-3 text-sm text-gray-600">No notifications.</div>
                          ) : (
                            <div className="max-h-64 overflow-auto">
                              {adminNotifications.slice(0, 8).map((n, idx) => (
                                <div key={idx} className="px-3 py-2 border-b">
                                  <div className="text-sm font-medium">{n.type === 'teacher_signup' ? 'New Teacher Signup' : 'Notification'}</div>
                                  <div className="text-sm text-gray-700">{n.email}</div>
                                  <div className="text-xs text-gray-500">{new Date(n.time).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="px-3 py-2 flex items-center justify-between">
                            <button className="text-blue-600 text-sm hover:text-blue-700" onClick={() => { setCurrentPage('admindashboard'); setShowNotifications(false); }}>Open Admin Dashboard</button>
                          </div>
                        </>
                      )}
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
              <button onClick={() => (user ? (setCurrentPage('questions'), setMobileNavOpen(false)) : setShowAuthModal(true))} className="px-3 py-2 text-left rounded hover:bg-gray-800">Questions</button>
              <button onClick={() => (user ? (setCurrentPage('resources'), setMobileNavOpen(false)) : setShowAuthModal(true))} className="px-3 py-2 text-left rounded hover:bg-gray-800">Resources</button>
              <button onClick={() => (user ? (setCurrentPage('contributors'), setMobileNavOpen(false)) : setShowAuthModal(true))} className="px-3 py-2 text-left rounded hover:bg-gray-800">Contributors</button>
              <button onClick={() => (user ? (setCurrentPage('subjects'), setMobileNavOpen(false)) : setShowAuthModal(true))} className="px-3 py-2 text-left rounded hover:bg-gray-800">Subjects</button>
              {user && user.role === 'admin' && (
                <button onClick={() => { setCurrentPage('admindashboard'); setMobileNavOpen(false); }} className="px-3 py-2 text-left rounded hover:bg-gray-800">Admin Dashboard</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
