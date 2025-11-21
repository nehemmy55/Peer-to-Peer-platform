import React, { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [showTeacherApprovals, setShowTeacherApprovals] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get pending teachers from users data
  const pendingTeachers = useMemo(() => {
    return users.filter(user => 
      user.role === 'teacher' && 
      (user.displayStatus === 'Pending' || user.status === 'pending')
    );
  }, [users]);

  // Load current user and all users
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        // Load all users
        const usersRes = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
          console.log('Loaded users:', usersData.users);
          console.log('Pending teachers:', usersData.users.filter(u => 
            u.role === 'teacher' && (u.displayStatus === 'Pending' || u.status === 'pending')
          ));
        } else {
          console.error('Failed to load users:', usersRes.status);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh data
  const refreshData = async () => {
    try {
      const usersRes = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Filter users based on search and status
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return (users || [])
      .filter(u => status === 'all' || (u.displayStatus || u.status || '').toLowerCase() === status.toLowerCase())
      .filter(u => {
        if (!ql) return true;
        return (u.name || '').toLowerCase().includes(ql) ||
               (u.email || '').toLowerCase().includes(ql);
      });
  }, [users, q, status]);

 
  const chip = (s) => {
    const status = s || '';
    const tone = status === 'Active' ? 'bg-green-100 text-green-800' :
                 status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                 'bg-yellow-100 text-yellow-800';
    return <span className={`text-xs px-2 py-1 rounded ${tone}`}>{status}</span>;
  };

  // Delete user from system
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  // Handle teacher approval/rejection
  const handleTeacherAction = async (teacherId, action) => {
    try {
      console.log(`${action} teacher:`, teacherId);
      
      // First try the notifications endpoint
      let res = await fetch(`${API_BASE}/api/notifications/admin/teachers/${teacherId}/${action}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });

      // If notifications endpoint fails, try the admin endpoint
      if (!res.ok) {
        console.log('Notifications endpoint failed, trying admin endpoint...');
        res = await fetch(`${API_BASE}/api/admin/teachers/${teacherId}/${action}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to ${action} teacher: ${res.status} - ${errorText}`);
      }

      
      setUsers(prev => prev.map(user => 
        user.id === teacherId 
          ? { 
              ...user, 
              displayStatus: action === 'approve' ? 'Active' : 'Rejected',
              status: action === 'approve' ? 'active' : 'rejected'
            }
          : user
      ));
      
      alert(`Teacher ${action}d successfully!`);
      
    } catch (error) {
      console.error('Teacher action error:', error);
      alert(`Failed to ${action} teacher: ` + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar navigation */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r min-h-screen transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 border-b font-bold text-lg">
            {currentUser?.name || 'Admin'} 
            <span className="block text-xs text-gray-500">
              {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Administrator'}
            </span>
          </div>
          <nav className="p-4 space-y-2">
            <button className="w-full text-left px-3 py-2 rounded bg-blue-50 text-blue-700">Users</button>
            <div className="mt-6 text-xs uppercase text-gray-500">Teacher Approvals</div>
            <div className="mt-2 space-y-2">
              <button 
                onClick={() => setShowTeacherApprovals(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4" /> 
                  Pending Teachers
                </span>
                {pendingTeachers.length > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingTeachers.length}
                  </span>
                )}
              </button>
              <button 
                onClick={refreshData}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-blue-600"
              >
                ↻ Refresh List
              </button>
            </div>
          </nav>
          <div className="p-4 border-t">
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-6 w-full lg:w-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl lg:text-2xl font-bold">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              {pendingTeachers.length > 0 && (
                <button 
                  onClick={() => setShowTeacherApprovals(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Bell className="w-4 h-4" />
                  Pending Teachers ({pendingTeachers.length})
                </button>
              )}
              
            </div>
          </div>

          {/* Dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Pending Teachers</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingTeachers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => (u.displayStatus === 'Active' || u.status === 'active')).length}
              </p>
            </div>
          </div>

          {/* Search and filter controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users by name or email"
                className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="min-w-full">
              <div className="hidden lg:grid grid-cols-12 px-4 py-3 border-b text-sm text-gray-600">
                <div className="col-span-2">Name</div>
                <div className="col-span-3">Email Address</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Actions</div>
              </div>
              {loading ? (
                <div className="p-6 text-center text-gray-600">Loading users…</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No users found.</div>
              ) : (
                <>
                  {/* Desktop view */}
                  <div className="hidden lg:block">
                    {filtered.map((u) => (
                      <div key={u.id} className="grid grid-cols-12 px-4 py-4 border-b items-center">
                        <div className="col-span-2 font-medium">{u.name}</div>
                        <div className="col-span-3 text-gray-700 break-words">{u.email}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.role === 'admin' ? 'bg-red-100 text-red-800' :
                            u.role === 'teacher' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student'}
                          </span>
                        </div>
                        <div className="col-span-2">{chip(u.displayStatus || u.status)}</div>
                        <div className="col-span-3 flex gap-2">
                          {u.role === 'teacher' && (u.displayStatus === 'Pending' || u.status === 'pending') && (
                            <>
                              <button 
                                onClick={() => handleTeacherAction(u.id, 'approve')}
                                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleTeacherAction(u.id, 'reject')}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile view */}
                  <div className="lg:hidden">
                    {filtered.map((u) => (
                      <div key={u.id} className="px-4 py-4 border-b space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{u.name}</div>
                            <div className="text-sm text-gray-600 break-words">{u.email}</div>
                          </div>
                          <div>{chip(u.displayStatus || u.status)}</div>
                        </div>
                        <div className="text-sm">
                          <div>
                            <span className="text-gray-500">Role:</span>
                            <div className="mt-1">
                              <span className={`px-2 py-1 rounded text-xs ${
                                u.role === 'admin' ? 'bg-red-100 text-red-800' :
                                u.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 flex-wrap">
                          {u.role === 'teacher' && (u.displayStatus === 'Pending' || u.status === 'pending') && (
                            <>
                              <button 
                                onClick={() => handleTeacherAction(u.id, 'approve')}
                                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleTeacherAction(u.id, 'reject')}
                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Teacher approvals modal */}
      {showTeacherApprovals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Pending Teacher Approvals ({pendingTeachers.length})</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={refreshData}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => setShowTeacherApprovals(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {pendingTeachers.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No pending teacher approvals</p>
                  <p className="text-gray-500 text-sm mt-2">New teacher signups will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{teacher.name}</h4>
                          <p className="text-gray-600">{teacher.email}</p>
                          {teacher.school && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">School:</span> {teacher.school}
                            </p>
                          )}
                          {teacher.qualifications && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Qualifications:</span> {teacher.qualifications}
                            </p>
                          )}
                          {teacher.subject && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Subject:</span> {teacher.subject}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Registered: {new Date(teacher.createdAt || teacher.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleTeacherAction(teacher.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleTeacherAction(teacher.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}