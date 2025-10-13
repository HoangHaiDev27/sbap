import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReaderHeader from "../components/reader/ReaderHeader";
import ReaderSettings from "../components/reader/ReaderSettings";
import ReaderBookmarks from "../components/reader/ReaderBookmarks";
import BookReader from "../components/reader/BookReader";
import ReaderContents from "../components/reader/ReaderContents";
import { getBookDetail } from "../api/bookApi";

export default function ReaderManager({ bookId, chapterId }) {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("serif");
  const [theme, setTheme] = useState("dark");

  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showContents, setShowContents] = useState(!chapterId); // Mở mục lục nếu không có chapterId
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the actual book ID to use - prioritize props over params
  const actualBookId = bookId || id;
  
  // Debug logs
  console.log("ReaderManager - bookId prop:", bookId);
  console.log("ReaderManager - id from params:", id);
  console.log("ReaderManager - actualBookId:", actualBookId);
  console.log("ReaderManager - chapterId:", chapterId);
  console.log("ReaderManager - book:", book);

  // Fetch book data
  useEffect(() => {
    if (!actualBookId) {
      setLoading(false);
      return;
    }
    
    async function fetchBookData() {
      try {
        const bookData = await getBookDetail(actualBookId);
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookData();
  }, [actualBookId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Không tìm thấy sách</p>
        </div>
      </div>
    );
  }

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
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        theme={theme}
        setTheme={setTheme}
        chapterId={chapterId}
      />

      {/* Các panels được render trong BookReader */}
    </div>
  );
}
