import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';

export default function ManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Admin Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Manage Users</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Teachers</button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded border">Students</button>
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
              <p className="text-gray-600">Access  notes, study guides, and past papers shared by peers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  );
}
