import React from 'react';
import { MessageCircle, Users, Award, BookOpen } from 'lucide-react';

// Homepage component with overview and navigation
export default function HomePage({ subjects, setSelectedSubject, setCurrentPage, user, setShowQuestionModal, setShowAuthModal, questions, topContributors }) {
  return (
    <div>
     
      <div
        className="relative text-white py-24 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(20,20,20,0.6), rgba(20,20,20,0.6)), url(https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=1500&q=60)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Connect, Learn, Succeed Together</h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">Join thousands of students helping each other succeed. Ask questions, share knowledge, and build your reputation in our collaborative learning community.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => (user ? setShowQuestionModal(true) : setShowAuthModal(true))} className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center justify-center space-x-2 shadow">
              <MessageCircle className="w-5 h-5" />
              <span>Ask a Question</span>
            </button>
            <button onClick={() => (user ? setCurrentPage('questions') : setShowAuthModal(true))} className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition flex items-center justify-center space-x-2 shadow">
              <Users className="w-5 h-5" />
              <span>Browse Questions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features section */}
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
              <p className="text-gray-600">Access notes, study guides, and past papers shared by peers.</p>
            </div>
          </div>
        </div>
      </div>

     
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Subject</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {subjects.map((s) => (
              <button key={s} onClick={() => (user ? (setSelectedSubject(s), setCurrentPage('questions')) : setShowAuthModal(true))} className="px-4 py-2 bg-white border rounded-full hover:bg-gray-100">{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent questions section */}
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
                <button onClick={() => (user ? (setSelectedSubject('all'), setCurrentPage('questions')) : setShowAuthModal(true))} className="mt-3 text-blue-600 hover:underline text-sm">View in Questions</button>
              </div>
            ))}
          </div>
        </div>
      </div>
     </div>
  );
}