'use client';

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiHeadphoneLine,
  RiTimeLine,
  RiListCheck,
  RiStarFill,
  RiPlayFill,
  RiBookOpenLine,
  RiCoinLine,
} from "react-icons/ri";
import { getAudioBooks } from "../../api/audioBookApi";
import { getChapterAudioPrices } from "../../api/ownerBookApi";

export default function StoryGrid({
  selectedCategory,
  selectedDuration,
  selectedNarrator,
  sortBy,
}) {
  const [stories, setStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [audioTotalsByBook, setAudioTotalsByBook] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudioBooks() {
      try {
        setLoading(true);
        const data = await getAudioBooks();
        setStories(data.filter((b) => b.categories && b.categories.length > 0));
      } catch (err) {
        console.error("Failed to fetch audio books", err);
        setStories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAudioBooks();
  }, []);

  // (sẽ chuyển xuống dưới, sau khi currentStories được định nghĩa)

  // --- Filter ---
  const filteredStories = stories.filter((story) => {
    // Chuẩn hóa categories
    const storyCategories = Array.isArray(story.categories)
      ? story.categories.map((c) => c.trim())
      : typeof story.categories === "string"
      ? story.categories.split(",").map((c) => c.trim())
      : [];

    if (
      selectedCategory &&
      selectedCategory !== "Tất cả thể loại" &&
      !storyCategories.includes(selectedCategory)
    ) {
      return false;
    }

    if (
      selectedNarrator &&
      selectedNarrator !== "Tất cả người kể" &&
      story.narrator !== selectedNarrator
    )
      return false;

    if (selectedDuration && selectedDuration !== "Tất cả thời lượng") {
      const match = story.duration?.match(/(\d+)h/);
      const hours = match ? parseInt(match[1], 10) : 0;

      switch (selectedDuration) {
        case "Dưới 1 giờ":
          if (hours >= 1) return false;
          break;
        case "1-3 giờ":
          if (hours < 1 || hours > 3) return false;
          break;
        case "3-6 giờ":
          if (hours < 3 || hours > 6) return false;
          break;
        case "6-10 giờ":
          if (hours < 6 || hours > 10) return false;
          break;
        case "Trên 10 giờ":
          if (hours <= 10) return false;
          break;
      }
    }

    return true;
  });

  // --- Sort ---
  const sortedStories = [...filteredStories];
  switch (sortBy) {
    case "Mới nhất":
      sortedStories.sort((a, b) => b.id - a.id);
      break;
    case "Phổ biến nhất":
      sortedStories.sort((a, b) => b.reviews - a.reviews);
      break;
    case "Đánh giá cao":
      sortedStories.sort((a, b) => b.rating - a.rating);
      break;
    case "Thời lượng ngắn":
      sortedStories.sort(
        (a, b) => parseFloat(a.duration) - parseFloat(b.duration)
      );
      break;
    case "Đang khuyến mãi":
      // Ưu tiên sách có promotion, sau đó sort theo % giảm giá cao nhất
      sortedStories.sort((a, b) => {
        const aHasPromo = a.hasPromotion ? 1 : 0;
        const bHasPromo = b.hasPromotion ? 1 : 0;
        
        if (aHasPromo !== bHasPromo) {
          return bHasPromo - aHasPromo; // Sách có promotion lên trước
        }
        
        // Nếu cả 2 đều có promotion, sort theo % giảm giá
        if (aHasPromo && bHasPromo) {
          return (b.discountValue || 0) - (a.discountValue || 0);
        }
        
        return 0;
      });
      break;
    default:
      break;
  }

  // --- Pagination ---
  const totalPages = Math.ceil(sortedStories.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStories = sortedStories.slice(indexOfFirst, indexOfLast);

  // Tải tổng giá audio (raw) cho các sách đang hiển thị ở trang hiện tại
  useEffect(() => {
    const loadAudioTotals = async () => {
      try {
        const bookIds = currentStories.map((s) => s.id).filter(Boolean);
        if (bookIds.length === 0) return;

        const fetches = bookIds.map(async (bookId) => {
          try {
            const priceMap = await getChapterAudioPrices(bookId);
            // priceMap có thể là object { chapterId: price } hoặc array
            let total = 0;
            if (Array.isArray(priceMap)) {
              total = priceMap.reduce((sum, p) => sum + (p?.priceAudio || p?.price || 0), 0);
            } else if (priceMap && typeof priceMap === "object") {
              total = Object.values(priceMap).reduce((sum, v) => sum + (Number(v) || 0), 0);
            }
            return [bookId, total];
          } catch {
            return [bookId, 0];
          }
        });

        const results = await Promise.all(fetches);
        setAudioTotalsByBook((prev) => {
          const next = { ...prev };
          for (const [bookId, total] of results) next[bookId] = total;
          return next;
        });
      } catch {
        // ignore
      }
    };
    loadAudioTotals();
  }, [currentStories]);

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-400">Đang tải sách audio...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Grid stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {currentStories.map((story) => {
          const audioRaw = Math.round(audioTotalsByBook[story.id] || 0);
          const hasPromo = !!story?.hasPromotion && (story?.discountValue || 0) > 0;
          const audioDiscounted = hasPromo
            ? Math.max(0, Math.round(audioRaw * (1 - (story.discountValue || 0) / 100)))
            : null;

          return (
          <div
            key={story.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors flex flex-col h-full w-full"
          >
            <Link to={`/bookdetails/${story.id}`} className="flex flex-col h-full">
              <div className="relative">
                <img
                  src={story.image || "https://via.placeholder.com/300x400/374151/ffffff?text=Book"}
                  alt={story.title}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover object-top"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x400/374151/ffffff?text=Book";
                  }}
                />

                {/* Thể loại & Giảm giá */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[80%]">
                  {/* Badge giảm giá */}
                  {story.hasPromotion && story.discountValue && (
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 
                                   text-white px-2 py-1 rounded-full text-xs 
                                   font-bold shadow-lg backdrop-blur-sm animate-pulse">
                      🔥 -{Math.round(story.discountValue)}%
                    </span>
                  )}
                  {/* Categories */}
                  {Array.isArray(story.categories)
                    ? story.categories.slice(0, 2).map((cat, i) => (
                        <span
                          key={i}
                          className="bg-gradient-to-r from-purple-600 to-purple-400 
                                     text-white px-2 py-0.5 rounded-full text-[10px] 
                                     font-medium shadow-sm backdrop-blur-sm truncate"
                        >
                          {cat}
                        </span>
                      ))
                    : (
                        <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {story.categories}
                        </span>
                      )}
                </div>

                {/* Headphone Icon */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/50 rounded-full p-2">
                    <RiHeadphoneLine className="text-white text-sm" />
                  </div>
                </div>

                {/* Duration + Chapters */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                  <div className="bg-black/70 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex items-center justify-between text-white text-xs sm:text-sm gap-2">
                      <span className="flex items-center truncate">
                        <RiTimeLine className="mr-1 flex-shrink-0" /> <span className="truncate">{story.duration || "N/A"}</span>
                      </span>
                      <span className="flex items-center whitespace-nowrap">
                        <RiListCheck className="mr-1" /> {story.chapters || 0} chương
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-[200px] sm:min-h-[240px]">
                <h3 className="text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-2 truncate">Tác giả: {story.author}</p>
                <p className="text-orange-400 text-xs sm:text-sm mb-3 line-clamp-1">
                  Người kể: {story.narrator || "Đang cập nhật"}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-auto">
                  {/* Rating */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-400">
                    <RiStarFill className="text-yellow-400 mr-1" />
                    <span>{story.rating?.toFixed(1) || 0} ({story.reviews || 0})</span>
                  </div>
                  {/* Audio-only Price (with promotion if any) */}
                  <div className="flex flex-col items-end">
                    {hasPromo && audioRaw > 0 ? (
                      <>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-400 font-bold">
                          {audioDiscounted?.toLocaleString()}
                          <RiCoinLine className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 line-through">
                          {audioRaw.toLocaleString()}
                          <RiCoinLine className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-green-400 font-semibold">
                        {audioRaw.toLocaleString()}
                        <RiCoinLine className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>
                  {/* Play Button */}
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center justify-center gap-1">
                    <RiPlayFill className="text-sm sm:text-base" /> Nghe
                  </button>
                </div>
              </div>
            </Link>
          </div>
        );})}
      </div>

      {/* Empty */}
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <RiBookOpenLine className="text-6xl text-gray-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Không tìm thấy sách audio
          </h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
              currentPage === 1
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Trang trước
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1 text-gray-400 text-xs sm:text-sm">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                  currentPage === page
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
              currentPage === totalPages
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
