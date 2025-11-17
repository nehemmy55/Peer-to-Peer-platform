import React, { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [showTeacherApprovals, setShowTeacherApprovals] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        const usersRes = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);

        const teachersRes = await fetch('/api/admin/teachers/pending', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        const teachersData = await teachersRes.json();
        setPendingTeachers(teachersData.teachers || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return (users || [])
      .filter(u => status === 'all' || (u.displayStatus || '').toLowerCase() === status.toLowerCase())
      .filter(u => {
        if (!ql) return true;
        return (u.name || '').toLowerCase().includes(ql) ||
               (u.email || '').toLowerCase().includes(ql);
      });
  }, [users, q, status]);

  const chip = (s) => {
    const tone = s === 'Active' ? 'bg-green-100 text-green-800' :
                 s === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                 'bg-yellow-100 text-yellow-800';
    return <span className={`text-xs px-2 py-1 rounded ${tone}`}>{s}</span>;
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleTeacherAction = async (teacherId, action) => {
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/${action}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}` 
        }
      });
      
      if (!res.ok) throw new Error(`Failed to ${action} teacher`);
      
      setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
    } catch (error) {
      alert(`Failed to ${action} teacher: ` + error.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
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
                <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Pending Teachers</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{pendingTeachers.length}</span>
              </button>
            </div>
          </nav>
          <div className="p-4 border-t">
            <button onClick={() => { localStorage.removeItem('token'); location.reload(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
              <h2 className="text-xl lg:text-2xl font-bold">Users Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm hidden sm:inline">us EN</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users"
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
                        <div className="col-span-2">{chip(u.displayStatus)}</div>
                        <div className="col-span-3 flex gap-2">
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">View</button>
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
                  <div className="lg:hidden">
                    {filtered.map((u) => (
                      <div key={u.id} className="px-4 py-4 border-b space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{u.name}</div>
                            <div className="text-sm text-gray-600 break-words">{u.email}</div>
                          </div>
                          <div>{chip(u.displayStatus)}</div>
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
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">View</button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
                            className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
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

      {showTeacherApprovals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Pending Teacher Approvals</h3>
              <button 
                onClick={() => setShowTeacherApprovals(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {pendingTeachers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No pending teacher approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{teacher.name}</h4>
                          <p className="text-gray-600">{teacher.email}</p>
                          <p className="text-sm text-gray-500">{teacher.school}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleTeacherAction(teacher.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleTeacherAction(teacher.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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