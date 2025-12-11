import { Link } from "react-router-dom"; // thêm dòng này
import {
  RiArrowLeftLine,
  RiFileList3Line,
  RiBookmarkLine,
  RiSettings3Line,
  RiFullscreenLine,
  RiFullscreenExitLine
} from "react-icons/ri";
import { RiFileTextLine, RiRobotLine } from "react-icons/ri";
import { AiOutlinePlus } from "react-icons/ai";

export default function ReaderHeader({
  book,
  currentChapter,
  bookmarks,
  isFullscreen,
  toggleFullscreen,
  setShowSettings,
  setShowBookmarks,
  setShowContents,
  addBookmark,
  setShowSummary,
}) {
  // Debug logs
  console.log("ReaderHeader - book object:", book);
  console.log("ReaderHeader - book.id:", book?.id);
  console.log("ReaderHeader - book.bookId:", book?.bookId);
  console.log("ReaderHeader - currentChapter:", currentChapter);
  
  // Calculate chapter number
  const chapterNumber = book?.chapters?.findIndex(ch => ch.chapterId === currentChapter?.chapterId) + 1;
  console.log("ReaderHeader - chapterNumber:", chapterNumber);
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-2 sm:p-4 bg-gray-800 sticky top-0 z-50">
      {/* Left: Back + Title */}
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <Link to={`/bookdetails/${book.id || book.bookId}`} onClick={() => {
          const bookId = book.id || book.bookId;
          console.log("ReaderHeader - Navigating back to book details:", { bookId });
        }} className="flex-shrink-0">
            <RiArrowLeftLine size={20} className="sm:w-[22px] sm:h-[22px] text-orange-500 hover:text-orange-600" />
        </Link>
        <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-white text-sm sm:text-base truncate">{book.title}</h1>
            <p className="text-xs sm:text-sm opacity-70 truncate">{currentChapter?.chapterTitle || "Chương không tìm thấy"}</p>
        </div>
        </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-wrap sm:flex-nowrap">
        <span className="text-xs sm:text-sm opacity-70 flex-shrink-0">
          Chương {chapterNumber || "N/A"}
        </span>

        <button
          onClick={() => setShowContents(true)}
          className="hover:text-orange-500 flex items-center gap-1 p-1.5 sm:p-0"
          title="Mục lục"
        >
          <RiFileList3Line size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden lg:inline">Mục lục</span>
        </button>

        <button
          onClick={() => setShowBookmarks(true)}
          className="hover:text-orange-500 flex items-center gap-1 p-1.5 sm:p-0"
          title={`Dấu chương (${bookmarks.length})`}
        >
          <RiBookmarkLine size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden lg:inline">
            Dấu chương ({bookmarks.length})
          </span>
        </button>

        <button
          onClick={addBookmark}
          className="hover:text-orange-500 flex items-center gap-1 p-1.5 sm:p-0"
          title="Thêm dấu chương"
        >
          <RiBookmarkLine size={18} className="sm:w-5 sm:h-5" />
          <AiOutlinePlus size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden lg:inline">Thêm dấu chương</span>
        </button>

        <button
          onClick={() => {
            console.log("ReaderHeader - Settings button clicked");
            setShowSettings(true);
          }}
          className="hover:text-orange-500 flex items-center gap-1 p-1.5 sm:p-0"
          title="Cài đặt"
        >
          <RiSettings3Line size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden lg:inline">Cài đặt</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="hover:text-orange-500 flex items-center gap-1 p-1.5 sm:p-0"
          title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        >
          {isFullscreen ? (
            <RiFullscreenExitLine size={18} className="sm:w-5 sm:h-5" />
          ) : (
            <RiFullscreenLine size={18} className="sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
