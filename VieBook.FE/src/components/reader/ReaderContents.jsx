import React, { useState, useEffect } from "react";
import { RiCloseLine, RiBookOpenLine, RiLockLine, RiCoinLine } from "react-icons/ri";
import { getUserId } from "../../api/authApi";
import { checkChapterOwnership } from "../../api/chapterPurchaseApi";
import toast from "react-hot-toast";

export default function ReaderContents({ book, onClose }) {
  // Sử dụng dữ liệu thật từ book prop thay vì mock data
  const chapters = book?.chapters || [];
  const [chapterOwnership, setChapterOwnership] = useState({}); // Lưu trạng thái sở hữu chương
  
  // Debug logs
  console.log("ReaderContents - book object:", book);
  console.log("ReaderContents - book.id:", book?.id);
  console.log("ReaderContents - book.bookId:", book?.bookId);
  console.log("ReaderContents - chapters:", chapters);

  // Kiểm tra quyền sở hữu chương khi component mount
  useEffect(() => {
    async function checkOwnership() {
      const isLoggedIn = getUserId() !== null;
      if (isLoggedIn && chapters.length > 0) {
        const ownershipPromises = chapters.map(async (chapter) => {
          const result = await checkChapterOwnership(chapter.chapterId);
          return { chapterId: chapter.chapterId, isOwned: result.isOwned || false };
        });
        
        const ownershipResults = await Promise.all(ownershipPromises);
        const ownershipMap = {};
        ownershipResults.forEach(result => {
          ownershipMap[result.chapterId] = result.isOwned;
        });
        setChapterOwnership(ownershipMap);
      } else {
        setChapterOwnership({});
      }
    }
    checkOwnership();
  }, [chapters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Popup */}
      <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <RiBookOpenLine /> Mục lục - {book?.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {chapters.map((chapter, index) => {
              const hasSoftUrl = chapter.chapterSoftUrl && chapter.chapterSoftUrl.trim() !== "";
              const isLoggedIn = getUserId() !== null;
              const isOwned = chapterOwnership[chapter.chapterId] || false;
              const isFree = !chapter.priceAudio || chapter.priceAudio === 0;
              const isDisabled = !hasSoftUrl || !isLoggedIn || (!isOwned && !isFree);
              const chapterNumber = index + 1;
              
              // Debug logs
              console.log(`ReaderContents - Chapter ${chapterNumber}:`, {
                chapterId: chapter.chapterId,
                chapterTitle: chapter.chapterTitle,
                chapterNumber: chapterNumber,
                index: index
              });
              
              return (
                <div
                  key={chapter.chapterId || index}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isDisabled
                      ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-orange-500 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.error("Bạn phải đăng nhập để đọc chương");
                      return;
                    }
                    if (!isOwned && !isFree) {
                      toast.error("Bạn cần mua chương này để đọc");
                      return;
                    }
                    if (!hasSoftUrl) {
                      return;
                    }
                    // Navigate to chapter reader
                    const bookId = book.id || book.bookId;
                    console.log("ReaderContents - Navigating to chapter:", { bookId, chapterId: chapter.chapterId });
                    window.location.href = `/reader/${bookId}/chapter/${chapter.chapterId}`;
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Số thứ tự chương */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isDisabled 
                          ? "bg-gray-600 text-gray-400" 
                          : "bg-orange-600 text-white"
                      }`}>
                        {chapterNumber}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1 truncate">
                          {chapter.chapterTitle}
                        </h4>
                        {!isLoggedIn && (
                          <p className="text-xs text-red-400 mb-1">
                            Vui lòng đăng nhập để đọc chương
                          </p>
                        )}
                        {isLoggedIn && !isOwned && !isFree && (
                          <p className="text-xs text-orange-400 mb-1">
                            Cần mua chương này để đọc
                          </p>
                        )}
                        {isLoggedIn && isOwned && !hasSoftUrl && (
                          <p className="text-xs text-gray-400 mb-1">
                            Chương không có bản mềm
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          {isFree ? (
                            <span className="text-green-400 font-medium">
                              Miễn phí
                            </span>
                          ) : chapter.priceAudio && (
                            <span className="text-orange-400 flex items-center gap-1">
                              {chapter.priceAudio.toLocaleString()}
                              <RiCoinLine className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!isLoggedIn ? (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : !isOwned && !isFree ? (
                        <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : hasSoftUrl ? (
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
