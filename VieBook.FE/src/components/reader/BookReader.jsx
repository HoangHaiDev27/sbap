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
import { getMyPurchases } from "../../api/chapterPurchaseApi";
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
  const [purchasedChapters, setPurchasedChapters] = useState([]); // Lưu danh sách chương đã mua
  const [pendingCharOffset, setPendingCharOffset] = useState(null);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const lastSavedPosRef = useRef(null);
  const isSavingRef = useRef(false);
  const offsetHintTimerRef = useRef(null);
  const [offsetHint, setOffsetHint] = useState(null);
  const [chapterSummary, setChapterSummary] = useState("");

  const dedupeBookmarks = (items) => {
    const map = new Map();
    for (const b of items) {
      const key = `${b.bookId}-${b.chapterReadId || b.chapterListenId || 'x'}`;
      map.set(key, b); // keep last one
    }
    return Array.from(map.values());
  };

  // Tìm chương hiện tại
  const currentChapter = book?.chapters?.find(ch => ch.chapterId === parseInt(chapterId));
  
  // Đồng bộ summary ban đầu từ dữ liệu book (nếu có)
  useEffect(() => {
    if (currentChapter?.chapterSummarize) {
      setChapterSummary(currentChapter.chapterSummarize);
    } else {
      setChapterSummary("");
    }
  }, [currentChapter?.chapterId, currentChapter?.chapterSummarize]);

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
                let restored = false;
                if (textRef.current) {
                  const r = createRangeAtAbsoluteOffset(textRef.current, savedBookmark.pagePosition);
                  if (r) {
                    const rect = r.getBoundingClientRect();
                    window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: 'auto' });
                    restored = true;
                  }
                }
                if (!restored) {
                  window.scrollTo({ top: savedBookmark.pagePosition, behavior: 'auto' });
                }
                
                // Update local bookmarks state with the loaded bookmark (chỉ của cuốn sách hiện tại)
                const newBookmark = {
                  bookmarkId: savedBookmark.bookmarkId,
                  chapterReadId: parseInt(chapterId),
                  bookId: book.bookId,
                  pagePosition: savedBookmark.pagePosition,
                  createdAt: savedBookmark.createdAt
                };
                // Dùng functional update và kiểm tra trên state mới nhất để tránh thêm trùng do stale closure
                setBookmarks((prev) => {
                  const exists = prev.some((b) =>
                    (b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)) &&
                    b.bookId === book.bookId
                  );
                  if (exists) return prev;
                  const next = [...prev, newBookmark];
                  const deduped = dedupeBookmarks(next);
                  console.log("BookReader - Added bookmark to local state for book:", book.bookId, "chapter:", chapterId, "after dedupe size:", deduped.length);
                  return deduped;
                });
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
  }, [currentChapter?.chapterSoftUrl, chapterId]);

  // Auto-update bookmark when user scrolls (page scroll)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const targetPos = pendingCharOffset != null ? pendingCharOffset : scrollPosition;
      
      // Only auto-save if we have a valid character offset (user selected text)
      // Don't auto-save with scrollPosition only as it can be 0
      if (pendingCharOffset == null) {
        return;
      }

      // Debounce: 1s sau khi dừng scroll mới lưu
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(async () => {
        // Guard: tránh gọi khi đang lưu hoặc không có thay đổi đáng kể
        const prev = lastSavedPosRef.current;
        const MIN_DELTA = 50; // px/char
        if (prev != null && Math.abs(targetPos - prev) < MIN_DELTA) return;

        // Chỉ lưu nếu đã có bookmark cho chương này (tránh tạo spam liên tục)
        const existingBookmark = bookmarks.find(b => 
          (b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)) &&
          b.bookId === book.bookId
        );
        if (!existingBookmark) return;

        if (isSavingRef.current) return;
        isSavingRef.current = true;
        try {
          const bookmarkData = {
            bookId: book.bookId,
            chapterReadId: parseInt(chapterId),
            pagePosition: targetPos
          };

          await createOrUpdateBookmark(bookmarkData);
          lastSavedPosRef.current = targetPos;

          const updatedBookmarks = dedupeBookmarks(bookmarks.map(b => 
            (b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)) && b.bookId === book.bookId
              ? { ...b, pagePosition: targetPos, createdAt: new Date().toISOString() }
              : b
          ));
          setBookmarks(updatedBookmarks);
        } catch (error) {
          console.error("Error auto-updating bookmark:", error);
        } finally {
          isSavingRef.current = false;
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [chapterId, bookmarks, pendingCharOffset, book?.bookId]);

  const getChapterTextNodes = (rootEl) => {
    // Accept ALL text nodes, including whitespace/newline-only nodes
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  };

  const getAbsoluteOffsetFromClick = (rootEl, clientX, clientY) => {
    const sel = window.getSelection();
    if (!sel) return null;
    let startNode = null;
    let startOffset = 0;
    // Try caret by point
    let pointRange = null;
    if (document.caretRangeFromPoint) {
      pointRange = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (pos) {
        const r = document.createRange();
        r.setStart(pos.offsetNode, pos.offset);
        r.collapse(true);
        pointRange = r;
      }
    }
    if (pointRange && pointRange.startContainer) {
      startNode = pointRange.startContainer;
      startOffset = pointRange.startOffset;
    } else {
      // Fallback: use current selection anchor
      if (sel.anchorNode) {
        startNode = sel.anchorNode;
        startOffset = sel.anchorOffset || 0;
      } else {
        return null;
      }
    }
    const textNodes = getChapterTextNodes(rootEl);
    let total = 0;
    for (const node of textNodes) {
      if (node === startNode) {
        return total + startOffset;
      }
      total += node.nodeValue.length;
    }
    return null;
  };

  const createRangeAtAbsoluteOffset = (rootEl, absOffset) => {
    const textNodes = getChapterTextNodes(rootEl);
    let remaining = absOffset;
    for (const node of textNodes) {
      const len = node.nodeValue.length;
      if (remaining <= len) {
        const r = document.createRange();
        r.setStart(node, Math.max(0, remaining));
        r.collapse(true);
        return r;
      }
      remaining -= len;
    }
    return null;
  };

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

  // Load bookmarks from API - chỉ load bookmark của cuốn sách hiện tại
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!book?.bookId) {
        setBookmarks([]);
        return;
      }

      try {
        setLoadingBookmarks(true);
        const userBookmarks = await getUserBookmarks();
        // Filter chỉ bookmark của cuốn sách hiện tại + dedupe theo (bookId, chapterId)
        const bookBookmarks = userBookmarks.filter(b => b.bookId === book.bookId);
        setBookmarks(dedupeBookmarks(bookBookmarks));
        console.log("BookReader - Loaded bookmarks for book:", book.bookId, bookBookmarks);
        console.log("BookReader - Total user bookmarks:", userBookmarks.length);
        console.log("BookReader - Filtered book bookmarks:", bookBookmarks.length);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
        setBookmarks([]);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    loadBookmarks();
  }, [book?.bookId]); // Chỉ load lại khi bookId thay đổi

  // Load purchased chapters from API
  useEffect(() => {
    const loadPurchasedChapters = async () => {
      const isLoggedIn = getUserId() !== null;
      if (isLoggedIn) {
        try {
          console.log("BookReader - Loading purchased chapters");
          const response = await getMyPurchases();
          const purchases = response?.data || [];
          const purchasedChapterIds = purchases.map((p) => p.chapterId);
          setPurchasedChapters(purchasedChapterIds);
          console.log("BookReader - Loaded purchased chapters:", purchasedChapterIds);
        } catch (error) {
          console.error("BookReader - Error loading purchased chapters:", error);
          setPurchasedChapters([]);
        }
      } else {
        setPurchasedChapters([]);
      }
    };

    loadPurchasedChapters();
  }, []);

  // Add/remove bookmarks with scroll position
  const addBookmark = async () => {
    try {
      // Require selecting a character position before adding a bookmark
      if (pendingCharOffset == null) {
        toast.error("Hãy chọn từ mà bạn muốn đánh dấu");
        return;
      }

      // Check if bookmark already exists for this chapter (chỉ trong cuốn sách hiện tại)
      const existingBookmark = bookmarks.find(b => 
        (b.chapterReadId === parseInt(chapterId) || b.chapterListenId === parseInt(chapterId)) &&
        b.bookId === book.bookId
      );
      
      if (existingBookmark) {
        // If bookmark exists, show message that chapter is already bookmarked
        toast("Chương này đã được đánh dấu", {
          style: {
            background: "#10b981",
            color: "#fff",
          },
        });
        return;
      }
      
      const bookmarkData = {
        bookId: book.bookId,
        chapterReadId: parseInt(chapterId),
        pagePosition: pendingCharOffset
      };
      
      const result = await createOrUpdateBookmark(bookmarkData);
      console.log("BookReader - Bookmark saved to API:", result);
      
      // Update local state - chỉ giữ bookmark của cuốn sách hiện tại
      const updatedBookmarks = bookmarks.filter(b => 
        (b.chapterReadId !== parseInt(chapterId) && b.chapterListenId !== parseInt(chapterId)) &&
        b.bookId === book.bookId
      );
      updatedBookmarks.push({
        bookmarkId: result.bookmarkId,
        chapterReadId: parseInt(chapterId),
        bookId: book.bookId,
        pagePosition: pendingCharOffset,
        createdAt: result.createdAt
      });
      setBookmarks(dedupeBookmarks(updatedBookmarks));
      console.log("BookReader - Added bookmark for book:", book.bookId, "chapter:", chapterId);
      
      toast.success("Đã thêm bookmark tại vị trí chữ đã chọn");
      
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast.error("Không thể thêm bookmark. Vui lòng thử lại.");
    }
  };
  
  const removeBookmark = async (bookmarkId) => {
    try {
      // Delete bookmark from database using bookmarkId
      await deleteBookmark(bookmarkId);
      
      // Update local state - chỉ filter bookmark của cuốn sách hiện tại
      const newBookmarks = bookmarks.filter((b) => 
        b.bookmarkId !== bookmarkId && b.bookId === book.bookId
      );
      setBookmarks(newBookmarks);
      
      console.log("BookReader - Bookmark deleted from database and local state for book:", book.bookId);
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

      {/* Layout tổng: dùng full width, chỉ padding ngang để mục lục sát lề trái */}
      <div className="w-full px-4 py-8">
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl shadow-xl px-4 py-5 lg:px-6 lg:py-6 flex gap-4 lg:gap-10 items-start">
          {/* Sidebar danh sách chương */}
          <div className="w-80 hidden lg:block flex-shrink-0">
            <ReaderContents
              book={book}
              purchasedChapters={purchasedChapters}
              mode="sidebar"
            />
          </div>

          {/* Nội dung chính */}
          <main className="flex-1 relative">
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
                ref={contentRef}
              >
                <pre
                  ref={textRef}
                  className="whitespace-pre-wrap break-words prose prose-lg max-w-none"
                  style={{ cursor: 'text' }}
                  onClickCapture={(e) => {
                    if (!textRef.current) return;
                    const x = e.clientX;
                    const y = e.clientY;
                    const abs = getAbsoluteOffsetFromClick(textRef.current, x, y);
                    if (abs != null) {
                      setPendingCharOffset(abs);
                      if (offsetHintTimerRef.current) clearTimeout(offsetHintTimerRef.current);
                      setOffsetHint(`Vị trí chữ: ${abs}`);
                      offsetHintTimerRef.current = setTimeout(() => setOffsetHint(null), 1500);
                    }
                  }}
                  onClick={(e) => {
                    if (!textRef.current) return;
                    const x = e.clientX;
                    const y = e.clientY;
                    const abs = getAbsoluteOffsetFromClick(textRef.current, x, y);
                    if (abs != null) {
                      setPendingCharOffset(abs);
                      if (offsetHintTimerRef.current) clearTimeout(offsetHintTimerRef.current);
                      setOffsetHint(`Vị trí chữ: ${abs}`);
                      offsetHintTimerRef.current = setTimeout(() => setOffsetHint(null), 1500);
                    }
                  }}
                >
                  {chapterContent}
                </pre>
                {offsetHint && (
                  <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow">
                    {offsetHint}
                  </div>
                )}
              </div>
            </>
          )}
          </main>
        </div>
      </div>

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
              const v = bookmark.pagePosition || 0;
              let handled = false;
              if (contentRef.current && v > 0) {
                const r = createRangeAtAbsoluteOffset(contentRef.current, v);
                if (r) {
                  const rect = r.getBoundingClientRect();
                  window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: 'auto' });
                  handled = true;
                }
              }
              if (!handled) {
                window.scrollTo({ top: v, behavior: 'auto' });
              }
            }}
            book={book}
          />
        )}

        {showContents && (
          <ReaderContents
            book={book}
            purchasedChapters={purchasedChapters}
            onClose={() => setShowContents(false)}
            onRefreshPurchases={async () => {
              try {
                console.log("BookReader - Refreshing purchased chapters");
                const response = await getMyPurchases();
                const purchases = response?.data || [];
                const purchasedChapterIds = purchases.map((p) => p.chapterId);
                setPurchasedChapters(purchasedChapterIds);
                console.log("BookReader - Refreshed purchased chapters:", purchasedChapterIds);
              } catch (error) {
                console.error("BookReader - Error refreshing purchased chapters:", error);
              }
            }}
          />
        )}

        {showSummary && (
          <ReaderSummary
            chapterId={currentChapter?.chapterId}
            chapterContent={chapterContent}
            chapterTitle={currentChapter?.chapterTitle}
            initialSummary={chapterSummary}
            onClose={() => setShowSummary(false)}
            onSummarySaved={(rawSummary) => {
              // Lưu lại tóm tắt thô để lần mở sau dùng luôn, không cần reload
              setChapterSummary(rawSummary || "");
            }}
          />
        )}
    </div>
  );
}
