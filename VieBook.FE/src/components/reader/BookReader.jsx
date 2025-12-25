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
  getBookmarkByChapter,
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
  const [chapterOwnershipChecked, setChapterOwnershipChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [purchasesLoaded, setPurchasesLoaded] = useState(false);

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

    // Chỉ lưu lịch sử khi đã kiểm tra quyền truy cập VÀ có quyền truy cập
    if (!chapterOwnershipChecked || !hasAccess) {
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
        console.log("Reading history saved successfully for chapter:", chapterId);
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
  }, [book?.bookId, chapterId, hasSavedReadingHistory, chapterOwnershipChecked, hasAccess]);

  // Check chapter ownership before allowing access
  useEffect(() => {
    if (!currentChapter || !chapterId) return;

    const isLoggedIn = getUserId() !== null;
    const currentUserId = getUserId();
    const isOwner =
      isLoggedIn && String(currentUserId) === String(book?.ownerId);
    const isFree = !currentChapter.priceSoft || currentChapter.priceSoft === 0;
    const isPurchased = purchasedChapters.includes(currentChapter.chapterId);

    console.log("BookReader - Access check (local state):", {
      isLoggedIn,
      currentUserId,
      bookOwnerId: book?.ownerId,
      isOwner,
      isFree,
      chapterId,
      chapterPrice: currentChapter.priceSoft,
      purchasedChapters,
      isPurchased,
      purchasesLoaded,
    });

    // Nếu cần kiểm tra mua (không phải owner, không free, đã đăng nhập) mà purchases chưa load xong
    // thì chưa quyết định quyền truy cập, tránh nháy màn hình "không thể truy cập"
    if (isLoggedIn && !isOwner && !isFree && !purchasesLoaded) {
      setChapterOwnershipChecked(false);
      return;
    }

    // Quyền truy cập:
    // - Chủ sách
    // - Chương miễn phí
    // - User đã mua chương (trong purchasedChapters)
    const canAccess = isOwner || isFree || isPurchased;
    setHasAccess(canAccess);
    setChapterOwnershipChecked(true);
  }, [currentChapter, chapterId, book?.ownerId, purchasedChapters, purchasesLoaded]);

  // Tải nội dung từ Cloudinary - chỉ khi có quyền truy cập
  useEffect(() => {
    async function fetchChapterContent() {
      console.log("BookReader - fetchChapterContent called:", {
        chapterOwnershipChecked,
        hasAccess,
        chapterSoftUrl: currentChapter?.chapterSoftUrl
      });
      
      // Don't load content if access hasn't been checked or is denied
      if (!chapterOwnershipChecked || !hasAccess) {
        console.log("BookReader - Content loading blocked:", {
          chapterOwnershipChecked,
          hasAccess,
          reason: !chapterOwnershipChecked ? "Ownership not checked" : "No access"
        });
        setLoading(false);
        return;
      }
      
      if (!currentChapter?.chapterSoftUrl) {
        console.log("BookReader - No chapterSoftUrl found");
        setLoading(false);
        return;
      }

      console.log("BookReader - Starting Cloudinary fetch");
      try {
        setLoading(true);
        const response = await fetch(currentChapter.chapterSoftUrl);
        if (response.ok) {
          const text = await response.text();
          setChapterContent(text);
          console.log("BookReader - Content loaded successfully");

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
  }, [currentChapter?.chapterSoftUrl, chapterId, chapterOwnershipChecked, hasAccess]);

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
      setPurchasesLoaded(false);
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
      setPurchasesLoaded(true);
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
      
      toast.success("Đã thêm dấu chương tại vị trí chữ đã chọn");
      
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

  // Show access denied message if ownership checked and no access
  if (chapterOwnershipChecked && !hasAccess) {
    const isLoggedIn = getUserId() !== null;
    const isOwner = isLoggedIn && (String(getUserId()) === String(book?.ownerId));
    const isFree = !currentChapter.priceSoft || currentChapter.priceSoft === 0;
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Không thể truy cập chương này</h2>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            {!isLoggedIn && (
              <p className="text-gray-300 mb-3">
                Bạn cần <span className="text-orange-400 font-medium">đăng nhập</span> để đọc chương này.
              </p>
            )}
            
            {isLoggedIn && !isOwner && !isFree && (
              <p className="text-gray-300 mb-3">
                Bạn cần <span className="text-orange-400 font-medium">mua chương này</span> để đọc nội dung.
              </p>
            )}
            
            <div className="text-sm text-gray-400">
              <p>Chương: {currentChapter.chapterTitle}</p>
              <p>Giá: {currentChapter.priceSoft || 0} xu</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {!isLoggedIn && (
              <button
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Đăng nhập
              </button>
            )}
            
            <button
              onClick={() => window.location.href = `/bookdetails/${book.id || book.bookId}`}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Quay lại trang sách
            </button>
          </div>
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
      <div className="w-full px-2 sm:px-4 py-2 sm:py-4 md:py-8">
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl sm:rounded-2xl shadow-xl px-2 sm:px-3 sm:py-4 md:px-4 md:py-5 lg:px-6 lg:py-6 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-10 items-start">
          {/* Sidebar danh sách chương */}
          <div className="w-full lg:w-80 hidden lg:block flex-shrink-0">
            <ReaderContents
              book={book}
              purchasedChapters={purchasedChapters}
              mode="sidebar"
            />
          </div>

          {/* Nội dung chính */}
          <main className="flex-1 relative w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">{currentChapter?.chapterTitle || "Chương không tìm thấy"}</h2>
            
            {/* AI Summary Button - Top right of content area */}
            <button
              onClick={() => {
                console.log("AI Summary button clicked");
                setShowSummary(true);
              }}
              className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-colors flex items-center gap-1.5 sm:gap-2 shadow-lg flex-shrink-0 self-start sm:self-auto"
              title="Tóm tắt bằng AI"
            >
              <RiRobotLine size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
              <span className="font-medium text-xs sm:text-sm">Tóm tắt AI</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-sm sm:text-base">Đang tải nội dung...</span>
            </div>
          ) : (
            <>
              <div
                className={`${currentTheme.contentBg} rounded-lg p-2 sm:p-3 md:p-4 lg:p-6 relative`}
                style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
                ref={contentRef}
              >
                <pre
                  ref={textRef}
                  className="whitespace-pre-wrap break-words prose prose-sm sm:prose-base md:prose-lg max-w-none"
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
                  <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow z-10">
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
