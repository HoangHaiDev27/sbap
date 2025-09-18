'use client';
import { useState } from 'react';
import BookDetailModal from '../../components/staff/pending-books/BookDetailModal';
import ApproveRejectModal from '../../components/staff/pending-books/ApproveRejectModal';

export default function PendingBooksManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // popup duyệt/từ chối
  const [actionType, setActionType] = useState(null);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ tạo dữ liệu test nhiều hơn
  const books = Array.from({ length: 22 }).map((_, i) => ({
    id: i + 1,
    title: `Sách demo ${i + 1}`,
    author: `Tác giả ${i + 1}`,
    owner: `Người gửi ${i + 1}`,
    category: ['Khoa học', 'Kỹ năng sống', 'Phát triển bản thân', 'Tâm lý học', 'Kinh doanh'][i % 5],
    submitDate: `2024-01-${(i % 28) + 1}`,
    status: ['pending', 'approved', 'rejected'][i % 3],
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
    summary: `Mô tả ngắn gọn cho sách demo ${i + 1}.`
  }));

  const categoryColors = {
    'Khoa học': 'bg-blue-100 text-blue-800',
    'Kỹ năng sống': 'bg-green-100 text-green-800',
    'Phát triển bản thân': 'bg-purple-100 text-purple-800',
    'Tâm lý học': 'bg-pink-100 text-pink-800',
    'Kinh doanh': 'bg-yellow-100 text-yellow-800'
  };

  const filteredBooks = books.filter((book) => {
    const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || book.category === filterCategory;
    const matchStatus = filterStatus === 'all' || book.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // tính trang
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleActionClick = (type, book) => {
    setSelectedBook(book);
    setActionType(type);
  };

  const handleConfirmAction = (type, id, reason) => {
    if (type === "approve") {
      alert(`✅ Đã duyệt sách ID ${id}`);
    } else {
      alert(`❌ Từ chối sách ID ${id}.\nLý do: ${reason}`);
    }
    setActionType(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Duyệt sách mới</h2>

          {/* Bộ lọc */}
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 text-black"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="all">Tất cả thể loại</option>
              {Object.keys(categoryColors).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          {/* Bảng sách */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">STT</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Sách</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Chủ sách</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Thể loại</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ngày gửi</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedBooks.map((book, index) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 flex items-center space-x-3">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="h-14 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{book.title}</p>
                          <p className="text-gray-600 text-sm">{book.author}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{book.owner}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[book.category] || 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {book.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{book.submitDate}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${book.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : book.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {book.status === 'pending'
                            ? 'Chờ duyệt'
                            : book.status === 'approved'
                              ? 'Đã duyệt'
                              : 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          title="Xem chi tiết"
                          onClick={() => handleViewDetails(book)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <i className="ri-eye-line"></i>
                        </button>

                        {book.status === 'pending' && (
                          <>
                            <button
                              title="Duyệt sách"
                              onClick={() => handleActionClick("approve", book)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              title="Từ chối sách"
                              onClick={() => handleActionClick("reject", book)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBooks.length === 0 && (
                <p className="p-4 text-center text-gray-500">Không có sách nào phù hợp</p>
              )}
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                Trang {currentPage}/{totalPages}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Popup chi tiết */}
      {showModal && selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setShowModal(false)}
          onApprove={(id) => handleActionClick("approve", selectedBook)}
          onReject={(id) => handleActionClick("reject", selectedBook)}
        />
      )}

      {/* Popup duyệt/từ chối */}
      {actionType && selectedBook && (
        <ApproveRejectModal
          type={actionType}
          book={selectedBook}
          onClose={() => setActionType(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
