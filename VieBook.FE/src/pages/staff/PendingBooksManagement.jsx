'use client';
import { useState, useEffect, useRef } from 'react';
import { getAllActiveBooks, getAllUsersWithProfile } from '../../api/staffApi';
import { getCategories } from '../../api/ownerBookApi';
import BookDetailModal from '../../components/staff/pending-books/BookDetailModal';
import ApproveRejectModal from '../../components/staff/pending-books/ApproveRejectModal';
import { getUserId } from '../../api/authApi';
import { RiEyeLine, RiCheckLine, RiCloseLine, RiMoreFill } from 'react-icons/ri';

export default function PendingBooksManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // popup duyệt/từ chối
  const [actionType, setActionType] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

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
    setOpenMenuId(null);
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const toggleMenu = (bookId) => {
    setOpenMenuId(openMenuId === bookId ? null : bookId);
  };


  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 sm:pt-24">
        <div className="p-3 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Duyệt sách mới</h2>

          {/* Bộ lọc */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="all">Tất cả thể loại</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Bảng sách */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                          <RiEyeLine className="text-lg" />
                        </button>

                        <button
                          title="Duyệt sách"
                          onClick={() => handleActionClick("approve", book)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        >
                          <RiCheckLine className="text-lg" />
                        </button>
                        <button
                          title="Từ chối sách"
                          onClick={() => handleActionClick("reject", book)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <RiCloseLine className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3">
              {paginatedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="h-20 w-14 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-bold flex-shrink-0">
                            #{(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{book.title}</h3>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">{book.author}</p>
                        <p className="text-xs text-gray-500 mb-2">Chủ sách: {book.owner}</p>
                        <p className="text-xs text-gray-500 mb-2">Ngày: {book.submitDate}</p>
                        <div className="flex flex-wrap gap-1">
                          {book.categories?.map(cat => (
                            <span
                              key={cat}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[cat] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Menu 3 chấm */}
                    <div className="relative flex-shrink-0" ref={(el) => (menuRefs.current[book.id] = el)}>
                      <button
                        onClick={() => toggleMenu(book.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        aria-label="Menu"
                      >
                        <RiMoreFill className="text-xl" />
                      </button>
                      
                      {openMenuId === book.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-40 max-w-[calc(100vw-1rem)]">
                          <button
                            onClick={() => {
                              handleViewDetails(book);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-t-lg transition"
                          >
                            <RiEyeLine className="text-blue-600 text-sm flex-shrink-0" />
                            <span className="truncate">Xem chi tiết</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              handleActionClick("approve", book);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition"
                          >
                            <RiCheckLine className="text-green-600 text-sm flex-shrink-0" />
                            <span className="truncate">Duyệt sách</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              handleActionClick("reject", book);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-b-lg transition text-red-600 hover:bg-gray-100"
                          >
                            <RiCloseLine className="text-sm flex-shrink-0" />
                            <span className="truncate">Từ chối sách</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <p className="p-4 text-center text-gray-500 text-sm sm:text-base">Không có sách nào phù hợp</p>
            )}
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-3 sm:px-6 py-4 border-t">
              <p className="text-xs sm:text-sm text-gray-600">
                Trang {currentPage}/{totalPages}
              </p>
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 border rounded-lg text-xs sm:text-sm disabled:opacity-50 text-gray-800"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 border rounded-lg text-xs sm:text-sm disabled:opacity-50 text-gray-800"
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
