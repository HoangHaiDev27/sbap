'use client';
import React, { useState, useEffect } from 'react';
import ApproveRejectModal from './ApproveRejectModal';
import { getChaptersByBookId, getWordCountFromUrl } from '../../../api/ownerBookApi';

export default function BookDetailModal({ book, onClose, staffId, onConfirm }) {
  const [actionType, setActionType] = useState(null);
  const [showChapters, setShowChapters] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [wordCounts, setWordCounts] = useState({});
  const [chapterContent, setChapterContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);

  if (!book) return null;

  const handleActionClick = (type) => {
    setActionType(type);
  };

  const handleConfirm = (type, bookId, reason) => {
    // Callback để refresh danh sách sách chờ duyệt
    setActionType(null);
    onClose();
    if (onConfirm) {
      onConfirm(type, bookId, reason);
    }
  };

  const handleViewChapterContent = async (chapter) => {
    setSelectedChapter(chapter);
    
    if (!chapter.chapterSoftUrl) {
      setChapterContent("Chương này chưa có nội dung.");
      return;
    }

    try {
      setLoadingContent(true);
      const response = await fetch(chapter.chapterSoftUrl);
      if (!response.ok) {
        throw new Error("Không thể tải nội dung");
      }
      const text = await response.text();
      setChapterContent(text);
    } catch (err) {
      console.error("Failed to fetch chapter content:", err);
      setChapterContent("Không thể tải nội dung chương. Vui lòng thử lại.");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCloseChapterModal = () => {
    setSelectedChapter(null);
    setChapterContent("");
  };

  const handleViewChapters = async () => {
    if (showChapters) {
      setShowChapters(false);
      return;
    }

    try {
      setLoadingChapters(true);
      const data = await getChaptersByBookId(book.id);
      setChapters(data || []);
      setShowChapters(true);

      // Fetch word counts
      if (data && data.length > 0) {
        const tasks = data.map(async (ch) => {
          if (ch.chapterSoftUrl) {
            try {
              const count = await getWordCountFromUrl(ch.chapterSoftUrl);
              return [ch.chapterId, Number(count) || 0];
            } catch (e) {
              return [ch.chapterId, 0];
            }
          }
          return [ch.chapterId, 0];
        });

        const results = await Promise.all(tasks);
        const counts = {};
        results.forEach(([id, cnt]) => {
          counts[id] = cnt;
        });
        setWordCounts(counts);
      }
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    } finally {
      setLoadingChapters(false);
    }
  };


  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* Modal box */}
        <div
          className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Chi tiết sách</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="ri-close-line text-gray-600 text-xl"></i>
            </button>
          </div>

          {/* Thông tin sách */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-4 sm:mb-6">
            <img
              className="h-40 sm:h-48 w-28 sm:w-36 rounded-lg object-cover object-top mx-auto md:mx-0 flex-shrink-0"
              src={book.cover}
              alt={book.title}
            />
            <div className="flex-1">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{book.title}</h4>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Tác giả:</span> {book.author}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Chủ sách:</span> {book.owner}
              </p>
              {book.uploaderType && (
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Loại người đăng:</span>{" "}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    book.uploaderType === "Owner" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {book.uploaderType === "Owner" ? "Tác giả" : "Người bán"}
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">Ngày gửi: {book.submitDate}</p>

              {/* Hiển thị tất cả category */}
              <div className="flex flex-wrap gap-2 mt-3">
                {book.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tóm tắt */}
          <h5 className="font-semibold text-gray-900 mb-2">Tóm tắt nội dung</h5>
          <p className="text-gray-700 leading-relaxed mb-6">{book.summary}</p>

          {/* Danh sách chương (nếu đã click xem) */}
          {showChapters && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">
                Danh sách chương ({chapters.length})
              </h5>
              {loadingChapters ? (
                <p className="text-gray-600 text-center py-4">Đang tải...</p>
              ) : chapters.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Sách chưa có chương nào</p>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 font-semibold">STT</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-semibold">Tiêu đề</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-semibold">Số từ</th>
                        <th className="px-3 py-2 text-left text-gray-700 font-semibold">Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {chapters.map((chapter, index) => (
                        <tr 
                          key={chapter.chapterId} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewChapterContent(chapter)}
                        >
                          <td className="px-3 py-2 text-gray-900">{index + 1}</td>
                          <td className="px-3 py-2 text-gray-900 font-medium">
                            {chapter.chapterTitle || "Chưa có tiêu đề"}
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {wordCounts[chapter.chapterId]?.toLocaleString() || "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {chapter.chapterPrice != null && chapter.chapterPrice > 0
                              ? `${chapter.chapterPrice.toLocaleString()} VNĐ`
                              : "Miễn phí"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tất cả các nút hành động - ngang hàng */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Bên trái - Các nút xem (chỉ hiện nếu có chứng chỉ) */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              {book.certificateUrl && (
                <>
                  <a
                    href={book.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
                  >
                    <i className="ri-file-certificate-line mr-2"></i>
                    <span className="hidden sm:inline">Xem chứng chỉ</span><span className="sm:hidden">Chứng chỉ</span>
                  </a>
                  <button
                    onClick={handleViewChapters}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
                  >
                    <i className={`mr-2 ${showChapters ? 'ri-arrow-up-s-line' : 'ri-book-open-line'}`}></i>
                    <span className="hidden sm:inline">{showChapters ? 'Ẩn danh sách chương' : 'Xem danh sách chương'}</span>
                    <span className="sm:hidden">{showChapters ? 'Ẩn chương' : 'Xem chương'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Bên phải - Nút duyệt/từ chối */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              <button
                onClick={() => handleActionClick('reject')}
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
              >
                <i className="ri-close-line mr-2"></i>Từ chối
              </button>
              <button
                onClick={() => handleActionClick('approve')}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
              >
                <i className="ri-check-line mr-2"></i>Duyệt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal duyệt/từ chối */}
      {actionType && (
        <ApproveRejectModal
          type={actionType}
          book={book}
          staffId={staffId}
          onClose={() => setActionType(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Popup nội dung chương */}
      {selectedChapter && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          onClick={handleCloseChapterModal}
        >
          <div
            className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {selectedChapter.chapterTitle || "Chưa có tiêu đề"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Số từ: {wordCounts[selectedChapter.chapterId]?.toLocaleString() || "—"} 
                  {selectedChapter.chapterPrice != null && selectedChapter.chapterPrice > 0
                    ? ` • Giá: ${selectedChapter.chapterPrice.toLocaleString()} VNĐ`
                    : " • Miễn phí"}
                </p>
              </div>
              <button
                onClick={handleCloseChapterModal}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <i className="ri-close-line text-gray-600 text-xl"></i>
              </button>
            </div>

            {/* Nội dung chương */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {loadingContent ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải nội dung...</p>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-900 text-sm leading-relaxed">
                  {chapterContent}
                </pre>
              )}
            </div>

            {/* Nút đóng */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseChapterModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
