import { useState, useEffect, useRef } from "react";
import ReaderHeader from "./ReaderHeader";
import ReaderSettings from "./ReaderSettings";
import ReaderBookmarks from "./ReaderBookmarks";
import ReaderContents from "./ReaderContents";
import ReaderSummary from "./ReaderSummary";
import { 
  getUserBookmarks, 
  createOrUpdateBookmark, 
  deleteBookmarkByChapter,
  deleteBookmark,
  getBookmarkByChapter 
} from "../../api/bookmarkApi";
import { getUserId } from "../../api/authApi";
import { saveReadingProgress, getCurrentReadingProgress } from "../../api/readingHistoryApi";
import toast from "react-hot-toast";
import { RiRobotLine } from "react-icons/ri";

export default function BookReader({ book, fontSize, setFontSize, fontFamily, setFontFamily, theme, setTheme, chapterId }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapterContent, setChapterContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [hasSavedReadingHistory, setHasSavedReadingHistory] = useState(false);
  const saveHistoryTimeoutRef = useRef(null);

  // Tìm chương hiện tại
  const currentChapter = book?.chapters?.find(ch => ch.chapterId === parseInt(chapterId));
  

  // Lưu lịch sử đọc khi vào trang (với debounce để tránh gọi nhiều lần)
  useEffect(() => {
    // Clear timeout cũ nếu có
    if (saveHistoryTimeoutRef.current) {
      clearTimeout(saveHistoryTimeoutRef.current);
    }

    // Chỉ save nếu chưa save cho bookId + chapterId này
    if (hasSavedReadingHistory) {
      return;
    }

    const saveReadingHistory = async () => {
      if (!book?.bookId || !chapterId) return;
      
      try {
        const readingData = {
          bookId: book.bookId,
          chapterId: parseInt(chapterId),
          readingType: 'Reading'
        };
        
        await saveReadingProgress(readingData);
        setHasSavedReadingHistory(true);
      } catch (error) {
        console.error("Error saving reading history:", error);
      }
    };

    // Debounce 500ms để tránh gọi nhiều lần
    saveHistoryTimeoutRef.current = setTimeout(saveReadingHistory, 500);

    // Cleanup function
    return () => {
      if (saveHistoryTimeoutRef.current) {
        clearTimeout(saveHistoryTimeoutRef.current);
      }
    };
  }, [book?.bookId, chapterId, hasSavedReadingHistory]);

  // Tải nội dung từ Cloudinary
  useEffect(() => {
    async function fetchChapterContent() {
      if (!currentChapter?.chapterSoftUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(currentChapter.chapterSoftUrl);
        if (response.ok) {
          const text = await response.text();
          setChapterContent(text);

          // Scroll to saved position after content is loaded (page scroll)
          setTimeout(async () => {
            try {
              const savedBookmark = await getBookmarkByChapter(parseInt(chapterId));
              if (savedBookmark && savedBookmark.pagePosition > 0) {
                // window-level scroll
                window.scrollTo({ top: savedBookmark.pagePosition, behavior: 'auto' });
                console.log("BookReader - Scrolled to saved position:", savedBookmark.pagePosition);
                  
                  // Update local bookmarks state with the loaded bookmark
                  const existingBookmark = bookmarks.find(b => 
                    b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)
                  );
                  
                  if (!existingBookmark) {
                    const newBookmark = {
                      bookmarkId: savedBookmark.bookmarkId,
                      chapterReadId: parseInt(chapterId),
                      bookId: book.bookId,
                      pagePosition: savedBookmark.pagePosition,
                      createdAt: savedBookmark.createdAt
                    };
                    setBookmarks(prev => [...prev, newBookmark]);
                  }
              }
            } catch (error) {
              console.error("Error loading bookmark position:", error);
            }
          }, 100); // Small delay to ensure content is rendered
        }
      } catch (error) {
        console.error("Error fetching chapter content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChapterContent();
  }, [currentChapter?.chapterSoftUrl, chapterId, bookmarks]);

  // Auto-update bookmark when user scrolls (page scroll)
  useEffect(() => {
    const handleScroll = async () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollDifference = Math.abs(scrollPosition - lastScrollPosition);
      
      // Only update if scroll difference is significant (more than 100px)
      if (scrollDifference > 100) {
        setLastScrollPosition(scrollPosition);
        
        // Update existing bookmark for this chapter (only if bookmark exists)
        const existingBookmark = bookmarks.find(b => 
          b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)
        );
        
        if (existingBookmark) {
          try {
            const bookmarkData = {
              bookId: book.bookId,
              chapterReadId: parseInt(chapterId),
              pagePosition: scrollPosition
            };
            
            await createOrUpdateBookmark(bookmarkData);
            
            // Update local state
            const updatedBookmarks = bookmarks.map(b => 
              (b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId))
                ? { ...b, pagePosition: scrollPosition, createdAt: new Date().toISOString() }
                : b
            );
            setBookmarks(updatedBookmarks);
            
            console.log("BookReader - Auto-updated bookmark position:", scrollPosition);
          } catch (error) {
            console.error("Error auto-updating bookmark:", error);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId, bookmarks, lastScrollPosition]);

  // Theme setup
  const themes = {
    dark: { bg: "bg-gray-900", text: "text-white", contentBg: "bg-gray-800" },
    light: { bg: "bg-white", text: "text-gray-900", contentBg: "bg-gray-50" },
    sepia: {
      bg: "bg-yellow-50",
      text: "text-amber-900",
      contentBg: "bg-yellow-100",
    },
  };
  const currentTheme = themes[theme];

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Load bookmarks from API
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoadingBookmarks(true);
        const userBookmarks = await getUserBookmarks();
        setBookmarks(userBookmarks);
        console.log("BookReader - Loaded bookmarks from API:", userBookmarks);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
        setBookmarks([]);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    loadBookmarks();
  }, []);

  // Add/remove bookmarks with scroll position
  const addBookmark = async () => {
    try {
      // Check if bookmark already exists for this chapter
      const existingBookmark = bookmarks.find(b => 
        b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)
      );
      
      if (existingBookmark) {
        // If bookmark exists, show message instead of creating new one
        toast("Bookmark đã tồn tại cho chương này. Vị trí đã được cập nhật.", {
          icon: "ℹ️",
          style: {
            background: "#3b82f6",
            color: "#fff",
          },
        });
        return;
      }
      
      // Get current window scroll position
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      const bookmarkData = {
        bookId: book.bookId,
        chapterReadId: parseInt(chapterId),
        pagePosition: scrollPosition
      };
      
      const result = await createOrUpdateBookmark(bookmarkData);
      console.log("BookReader - Bookmark saved to API:", result);
      
      // Update local state
      const updatedBookmarks = bookmarks.filter(b => 
        b.chapterReadId !== parseInt(chapterId) && b.chapterListenId !== parseInt(chapterId)
      );
      updatedBookmarks.push({
        bookmarkId: result.bookmarkId,
        chapterReadId: parseInt(chapterId),
        bookId: book.bookId,
        pagePosition: scrollPosition,
        createdAt: result.createdAt
      });
      setBookmarks(updatedBookmarks);
      
      toast.success("Đã thêm bookmark thành công");
      
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast.error("Không thể thêm bookmark. Vui lòng thử lại.");
    }
  };
  
  const removeBookmark = async (bookmarkId) => {
    try {
      // Delete bookmark from database using bookmarkId
      await deleteBookmark(bookmarkId);
      
      // Update local state
      const newBookmarks = bookmarks.filter((b) => b.bookmarkId !== bookmarkId);
      setBookmarks(newBookmarks);
      
      console.log("BookReader - Bookmark deleted from database and local state");
      toast.success("Đã xóa bookmark thành công");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      // Show error message to user
      toast.error("Không thể xóa bookmark. Vui lòng thử lại.");
    }
  };

  if (!book || !currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-500">Không tìm thấy sách hoặc chương</p>
        </div>
      </div>
    );
  }
    return (
      <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>
        {/* Header */}
        <ReaderHeader
          book={book}
          currentChapter={currentChapter}
          bookmarks={bookmarks}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          setShowSettings={setShowSettings}
          setShowBookmarks={setShowBookmarks}
          setShowContents={setShowContents}
          addBookmark={addBookmark}
        />


        {/* Nội dung chính */}
        <main className="max-w-4xl mx-auto px-4 py-8 relative">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{currentChapter?.chapterTitle || "Chương không tìm thấy"}</h2>
            
            {/* AI Summary Button - Top right of content area */}
            <button
              onClick={() => {
                console.log("AI Summary button clicked");
                setShowSummary(true);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-colors flex items-center gap-2 shadow-lg"
              title="Tóm tắt bằng AI"
            >
              <RiRobotLine size={18} />
              <span className="font-medium text-sm">Tóm tắt AI</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-3">Đang tải nội dung...</span>
            </div>
          ) : (
            <>
              <div
                className={`${currentTheme.contentBg} rounded-lg p-6`}
                style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
              >
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: chapterContent }}
                />
              </div>
            </>
          )}
        </main>

        {/* Panels */}
        {showSettings && (
          <>
            {console.log("BookReader - Rendering ReaderSettings")}
            <ReaderSettings
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              theme={theme}
              setTheme={setTheme}
              close={() => setShowSettings(false)}
            />
          </>
        )}

        {showBookmarks && (
          <ReaderBookmarks
            bookmarks={bookmarks}
            removeBookmark={removeBookmark}
            close={() => setShowBookmarks(false)}
            onBookmarkClick={(bookmark) => {
              // Scroll to the bookmark position
              const y = bookmark.pagePosition || 0;
              window.scrollTo({ top: y, behavior: 'auto' });
              console.log("BookReader - Scrolled to bookmark position:", y);
            }}
            book={book}
          />
        )}

        {showContents && (
          <ReaderContents
            book={book}
            onClose={() => setShowContents(false)}
          />
        )}

        {showSummary && (
          <ReaderSummary
            chapterContent={chapterContent}
            chapterTitle={currentChapter?.chapterTitle}
            onClose={() => setShowSummary(false)}
          />
        )}
      </div>
    );
}
