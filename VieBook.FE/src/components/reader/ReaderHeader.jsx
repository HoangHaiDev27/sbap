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
    <header className="flex justify-between items-center p-4 bg-gray-800 sticky top-0 z-50">
      {/* Left: Back + Title */}
      <div className="flex items-center space-x-2">
        <Link to={`/bookdetails/${book.id || book.bookId}`} onClick={() => {
          const bookId = book.id || book.bookId;
          console.log("ReaderHeader - Navigating back to book details:", { bookId });
        }}>
            <RiArrowLeftLine size={22} className="text-orange-500 hover:text-orange-600" />
        </Link>
        <div>
            <h1 className="font-semibold text-white">{book.title}</h1>
            <p className="text-sm opacity-70">{currentChapter?.chapterTitle || "Chương không tìm thấy"}</p>
        </div>
        </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        <span className="text-sm opacity-70">
          Chương {chapterNumber || "N/A"}
        </span>

        <button
          onClick={() => setShowContents(true)}
          className="hover:text-orange-500 flex items-center gap-1"
        >
          <RiFileList3Line size={20} />
          <span className="hidden sm:inline">Mục lục</span>
        </button>


        <button
          onClick={() => setShowBookmarks(true)}
          className="hover:text-orange-500 flex items-center gap-1"
        >
          <RiBookmarkLine size={20} />
          <span className="hidden sm:inline">
            Dấu chương ({bookmarks.length})
          </span>
        </button>

        <button
          onClick={addBookmark}
          className="hover:text-orange-500 flex items-center gap-1"
        >
          <RiBookmarkLine size={20} />
          <AiOutlinePlus size={14} />
          <span className="hidden sm:inline">Thêm dấu chương</span>
        </button>

        <button
          onClick={() => {
            console.log("ReaderHeader - Settings button clicked");
            setShowSettings(true);
          }}
          className="hover:text-orange-500 flex items-center gap-1"
        >
          <RiSettings3Line size={20} />
          <span className="hidden sm:inline">Cài đặt</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="hover:text-orange-500 flex items-center gap-1"
        >
          {isFullscreen ? (
            <RiFullscreenExitLine size={20} />
          ) : (
            <RiFullscreenLine size={20} />
          )}
        </button>
      </div>
    </header>
  );
}
