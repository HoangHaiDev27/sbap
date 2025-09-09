import React, { useState } from "react";
import ReaderHeader from "../components/reader/ReaderHeader";
import ReaderSettings from "../components/reader/ReaderSettings";
import ReaderBookmarks from "../components/reader/ReaderBookmarks";
import BookReader from "../components/reader/BookReader";
import ReaderContents from "../components/reader/ReaderContents";

export default function ReaderManager({ bookId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("serif");
  const [theme, setTheme] = useState("dark");

  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 📌 Demo dữ liệu sách
  const book = {
    id: bookId,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    totalPages: 320,
    currentChapter: "Chương 1: Những Nguyên Tắc Cơ Bản Trong Giao Tiếp ",
  };

  const addBookmark = () => {
    if (!bookmarks.includes(currentPage)) {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-white`}>
      {/* Header */}
      {/* <ReaderHeader
        book={book}
        currentPage={currentPage}
        bookmarks={bookmarks}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        setShowSettings={setShowSettings}
        setShowBookmarks={setShowBookmarks}
        setShowContents={setShowContents}
        addBookmark={addBookmark}
      /> */}

      {/* Nội dung sách */}
      <BookReader
        book={book}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        fontSize={fontSize}
        fontFamily={fontFamily}
        theme={theme}
      />

      {/* Cài đặt */}
      {showSettings && (
        <ReaderSettings
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          theme={theme}
          setTheme={setTheme}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Bookmark */}
      {showBookmarks && (
        <ReaderBookmarks
          bookmarks={bookmarks}
          setCurrentPage={setCurrentPage}
          removeBookmark={(page) =>
            setBookmarks(bookmarks.filter((p) => p !== page))
          }
          onClose={() => setShowBookmarks(false)}
        />
      )}

      {/* Mục lục */}
      {showContents && (
        <ReaderContents
          book={book}
          setCurrentPage={setCurrentPage}
          onClose={() => setShowContents(false)}
        />
      )}
    </div>
  );
}
