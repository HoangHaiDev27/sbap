'use client';
import { useState } from 'react';
import BookDetailModal from '../../components/staff/pending-books/BookDetailModal';

export default function PendingBooksManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const books = [
    {
      id: 1,
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      owner: 'Nguyễn Văn A',
      category: 'Khoa học',
      submitDate: '2024-01-20',
      status: 'pending',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
      summary: 'Khám phá lịch sử loài người từ thời kỳ đồ đá đến hiện tại...'
    },
    {
      id: 2,
      title: 'Đắc nhân tâm',
      author: 'Dale Carnegie',
      owner: 'Trần Thị B',
      category: 'Kỹ năng sống',
      submitDate: '2024-01-19',
      status: 'approved',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
      summary: 'Cuốn sách kinh điển về nghệ thuật giao tiếp...'
    },
    {
      id: 3,
      title: 'Atomic Habits',
      author: 'James Clear',
      owner: 'Lê Văn C',
      category: 'Phát triển bản thân',
      submitDate: '2024-01-18',
      status: 'rejected',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
      summary: 'Phương pháp thay đổi thói quen nhỏ để đạt kết quả lớn.'
    },
    {
      id: 4,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      owner: 'Phạm Thị D',
      category: 'Tâm lý học',
      submitDate: '2024-01-17',
      status: 'pending',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
      summary: 'Hai hệ thống tư duy của con người và cách chúng ảnh hưởng đến quyết định hàng ngày.'
    },
    {
      id: 5,
      title: 'The Lean Startup',
      author: 'Eric Ries',
      owner: 'Hoàng Văn E',
      category: 'Kinh doanh',
      submitDate: '2024-01-16',
      status: 'pending',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv',
      summary: 'Phương pháp khởi nghiệp tinh gọn giúp doanh nghiệp phát triển nhanh chóng và bền vững.'
    }
  ];

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

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleApprove = (id) => {
    if (confirm('Bạn có chắc chắn muốn duyệt sách này?')) {
      alert('✅ Duyệt sách thành công!');
      setShowModal(false);
    }
  };

  const handleReject = (id) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason && reason.trim()) {
      alert(`❌ Đã từ chối sách.\nLý do: ${reason}`);
      setShowModal(false);
    } else {
      alert('Bạn chưa nhập lý do từ chối!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
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
                  {filteredBooks.map((book, index) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-gray-700">{index + 1}</td>
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            categoryColors[book.category] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {book.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{book.submitDate}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            book.status === 'pending'
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
                        {/* Nút xem luôn đầu tiên */}
                        <button
                          onClick={() => handleViewDetails(book)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <i className="ri-eye-line"></i>
                        </button>

                        {book.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(book.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              onClick={() => handleReject(book.id)}
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
          </div>
        </div>
      </main>

      {/* Popup */}
      {showModal && selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
