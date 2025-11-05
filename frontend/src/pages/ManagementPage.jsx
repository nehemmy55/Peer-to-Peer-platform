import React from 'react';

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
    </div>
  );
}
