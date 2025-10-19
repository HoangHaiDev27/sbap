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

export default function StoryGrid({
  selectedCategory,
  selectedDuration,
  selectedNarrator,
  sortBy,
}) {
  const [stories, setStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchAudioBooks() {
      try {
        const data = await getAudioBooks();
        // lọc bỏ book có category rỗng để không bị option trống
        setStories(data.filter(b => b.category && b.category.trim() !== ""));
      } catch (err) {
        console.error("Failed to fetch audio books", err);
      }
    }
    fetchAudioBooks();
  }, []);

  // --- Filter ---
  const filteredStories = stories.filter((story) => {
    if (
      selectedCategory &&
      selectedCategory !== "Tất cả thể loại" &&
      story.category !== selectedCategory
    ) return false;

    if (
      selectedNarrator &&
      selectedNarrator !== "Tất cả người kể" &&
      story.narrator !== selectedNarrator
    ) return false;

    if (selectedDuration && selectedDuration !== "Tất cả thời lượng") {
      const match = story.duration.match(/(\d+)h/);
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
        (a, b) =>
          parseFloat(a.duration) - parseFloat(b.duration)
      );
      break;
    default:
      break;
  }

  // --- Pagination ---
  const totalPages = Math.ceil(sortedStories.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStories = sortedStories.slice(indexOfFirst, indexOfLast);

  // Pagination logic
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 2) {
        // Show first 3 pages, ellipsis, and last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        // Show first page, ellipsis, and last 3 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
      {/* Grid stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentStories.map((story) => (
          <div
            key={story.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors flex flex-col h-full"
          >
            <Link to={`/bookdetails/${story.id}`} className="flex flex-col h-full">
              <div className="relative">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 object-cover object-top"
                />
                {/* Genre Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {story.category}
                  </span>
                </div>
                {/* Headphone Icon */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/50 rounded-full p-2">
                    <RiHeadphoneLine className="text-white text-sm" />
                  </div>
                </div>
                {/* Duration + Chapters */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/70 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span className="flex items-center">
                        <RiTimeLine className="mr-1" /> {story.duration}
                      </span>
                      <span className="flex items-center">
                        <RiListCheck className="mr-1" /> {story.chapters} chương
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">Tác giả: {story.author}</p>
                <p className="text-orange-400 text-sm mb-3">
                  Người kể: {story.narrator || "Đang cập nhật"}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  {/* Rating */}
                  <div className="flex items-center text-sm text-gray-400">
                    <RiStarFill className="text-yellow-400 mr-1" />
                    <span>{story.rating} ({story.reviews})</span>
                  </div>
                  {/* Price */}
                  <div className="flex items-center gap-1 text-sm text-yellow-400 font-semibold">
                    {story.price}
                    <RiCoinLine className="w-5 h-5" />
                  </div>
                  {/* Play Button */}
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap flex items-center">
                    <RiPlayFill className="mr-1" /> Nghe
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty */}
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <RiBookOpenLine className="text-6xl text-gray-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Không tìm thấy truyện nói
          </h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Trang trước
          </button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page
                  ? "bg-orange-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages
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