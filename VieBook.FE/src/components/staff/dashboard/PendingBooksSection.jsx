import { useNavigate } from 'react-router-dom';

export default function PendingBooksSection({ pendingBooks }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/staff/pending-books');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sách chờ duyệt</h3>
          <button
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {pendingBooks.length > 0 ? (
            pendingBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={handleViewAll}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                  <p className="text-sm text-gray-600">Tác giả: {book.author}</p>
                  <p className="text-sm text-gray-500">Chủ sách: {book.owner}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {book.category}
                    </span>
                    <span className="text-xs text-gray-400">{book.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Không có sách chờ duyệt</p>
          )}
        </div>
      </div>
    </div>
  );
}

