import React from 'react';

export default function Footer() {
  return (
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
}
