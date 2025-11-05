import React from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ setShowAuthModal, authMode, setAuthMode, handleLogin /*, handleSignup*/ }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>

        {/* Login-only: signup removed */}
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
          {/* Removed signup link */}
        </form>
      </div>
    </div>
  );
}
