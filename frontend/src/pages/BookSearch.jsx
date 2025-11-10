import React from 'react';

export default function BookSearch({ searchBooks, bookResults, bookLoading, bookError }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Find Books</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); const q = e.target.q.value; searchBooks(q); }}
        className="flex gap-2 mb-6"
      >
        <input name="q" className="flex-1 border rounded px-3 py-2" placeholder="Search books, authors, topics..." />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
      </form>
      {bookLoading && <div>Loading...</div>}
      {bookError && <div className="text-red-600">{bookError}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bookResults.map((b) => {
          const info = b.volumeInfo || {};
          return (
            <div key={b.id} className="border rounded p-3 bg-white">
              <div className="font-semibold">{info.title}</div>
              <div className="text-sm text-gray-600">{(info.authors || []).join(', ')}</div>
              {info.imageLinks?.thumbnail && (
                <img alt={info.title} src={info.imageLinks.thumbnail} className="mt-2 rounded" />
              )}
              <a href={info.infoLink} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-2 inline-block">Details</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}