'use client';
import { useState, useEffect } from 'react';
import { getAllActiveBooks, getAllUsersWithProfile } from '../../api/staffApi';
import { getCategories } from '../../api/ownerBookApi';
import BookDetailModal from '../../components/staff/pending-books/BookDetailModal';
import ApproveRejectModal from '../../components/staff/pending-books/ApproveRejectModal';
import { getUserId } from '../../api/authApi';

export default function PendingBooksManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // popup duyệt/từ chối
  const [actionType, setActionType] = useState(null);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ data từ API
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]); // ✅ danh sách user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cateRes, bookRes, userRes] = await Promise.all([
          getCategories(),
          getAllActiveBooks(),
          getAllUsersWithProfile() // ✅ lấy tên user
        ]);

        setCategories(cateRes);
        setUsers(userRes);

        // map id -> name cho category
        const cateMap = Object.fromEntries(
          cateRes.map(c => [c.categoryId, c.name])
        );

        // map userId -> name
        const userMap = Object.fromEntries(
          userRes.map(u => [u.userId, u.name || u.email])
        );

        const mappedBooks = bookRes.map(b => {
          const categoryNames = b.categoryIds?.length > 0
            ? b.categoryIds.map(id => cateMap[id] || 'Khác')
            : ['Khác'];

          return {
            id: b.bookId,
            title: b.title,
            author: b.author,
            owner: userMap[b.ownerId] || '—',
            categories: categoryNames,
            submitDate: (() => {
              const d = new Date(b.createdAt);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              return `${hours}:${minutes} ${day}/${month}/${year}`;
            })(),
            cover: b.coverUrl || 'https://placehold.co/80x120',
            summary: b.description || '',
            certificateUrl: b.certificateUrl || null,
            uploaderType: b.uploaderType || null
          };
        });

        setBooks(mappedBooks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Màu động cho từng category
  const categoryColors = Object.fromEntries(
    categories.map((c, idx) => [
      c.name,
      [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-yellow-100 text-yellow-800'
      ][idx % 5]
    ])
  );

  const filteredBooks = books.filter((book) => {
    const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || book.categories?.includes(filterCategory);
    return matchSearch && matchCategory; // ✅ bỏ matchStatus
  });

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

  const handleConfirmAction = (type, bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setActionType(null);
    setShowModal(false);
  };


  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

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
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
              ))}
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
                        <div
                          className={`flex flex-wrap gap-1 ${book.categories?.length > 2 ? 'flex-col items-start' : ''}`}
                        >
                          {book.categories?.map(cat => (
                            <span
                              key={cat}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[cat] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{book.submitDate}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          title="Xem chi tiết"
                          onClick={() => handleViewDetails(book)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <i className="ri-eye-line"></i>
                        </button>

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
          staffId={getUserId()}
          onConfirm={(type, bookId) => handleConfirmAction(type, bookId)}
        />
      )}

      {/* Popup duyệt/từ chối */}
      {actionType && selectedBook && (
        <ApproveRejectModal
          type={actionType}
          book={selectedBook}
          staffId={getUserId()}
          onClose={() => setActionType(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
