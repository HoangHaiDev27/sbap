import {
  RiBookmarkLine,
  RiCloseLine,
  RiBook2Line,
  RiTimeLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmDialog from "../common/ConfirmDialog";
import { useState } from "react";

export default function ReaderBookmarks({
  bookmarks,
  removeBookmark,
  close,
  onBookmarkClick,
  book,
}) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChapterNumber = (bookmark) => {
    if (!bookmark || !book?.chapters) return bookmark?.chapterReadId || bookmark?.chapterListenId || "N/A";
    
    const chapterId = bookmark.chapterReadId || bookmark.chapterListenId;
    const chapterIndex = book.chapters.findIndex(ch => ch.chapterId === chapterId);
    return chapterIndex !== -1 ? chapterIndex + 1 : chapterId;
  };

  const handleBookmarkClick = (bookmark) => {
    // Navigate to the chapter with the bookmark position
    const chapterId = bookmark.chapterReadId || bookmark.chapterListenId;
    const bookId = book?.bookId || book?.id;
    
    if (chapterId && bookId) {
      // Navigate to the chapter reader page
      navigate(`/reader/${bookId}/chapter/${chapterId}`);
      close();
    }
  };

  const handleDeleteClick = (bookmark) => {
    setBookmarkToDelete(bookmark);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (bookmarkToDelete) {
      removeBookmark(bookmarkToDelete.bookmarkId);
      setBookmarkToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setBookmarkToDelete(null);
    setShowConfirmDialog(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay nền tối */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={close}
      ></div>

      {/* Popup */}
      <div className="relative bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <RiBookmarkLine /> Dấu Chương
            </h3>
            <button
              onClick={close}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <RiBookmarkLine size={48} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300">Chưa có dấu chương nào</p>
              <p className="text-sm text-gray-400 mt-2">Nhấn nút bookmark để lưu vị trí đọc</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => handleBookmarkClick(bookmark)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <RiBook2Line className="text-orange-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            Chương {getChapterNumber(bookmark)}
                          </span>
                          <RiArrowRightLine className="text-gray-400" size={16} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <RiTimeLine size={14} />
                            <span>{formatTimestamp(bookmark.createdAt)}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Vị trí: {Math.round(bookmark.pagePosition || 0)}px
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(bookmark);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Xóa bookmark"
                    >
                      <RiCloseLine size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xóa bookmark"
        message={`Bạn có chắc chắn muốn xóa bookmark cho chương ${bookmarkToDelete ? getChapterNumber(bookmarkToDelete) : 'này'}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}
