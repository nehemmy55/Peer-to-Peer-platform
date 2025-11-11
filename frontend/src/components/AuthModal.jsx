
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ setShowAuthModal, authMode, setAuthMode, handleLogin, handleSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const isLogin = authMode === 'login';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <input
                  name="school"
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`px-3 py-2 rounded border ${role === 'student' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`px-3 py-2 rounded border ${role === 'teacher' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                >
                  Teacher
                </button>
              </div>
              <input type="hidden" name="role" value={role} />
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          {isLogin && (
            <div className="text-center">
              <button onClick={() => setAuthMode('signup')} type="button" className="text-sm text-gray-700 hover:underline">
                Create an account
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="text-center">
              <button onClick={() => setAuthMode('login')} type="button" className="text-sm text-gray-700 hover:underline">
                Already have an account? Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
