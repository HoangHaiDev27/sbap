import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // icon đẹp

export default function BookCarousel({
  title,
  books,
  hasCategories,
  categories,
}) {
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollRef = useRef(null);

  const filteredBooks = useMemo(() => {
    if (!hasCategories || !categories || activeCategory === 0) return books;
    const selected = categories[activeCategory];
    if (!selected) return books;
    return (books || []).filter(
      (b) => (b?.category || "").toLowerCase() === selected.toLowerCase()
    );
  }, [books, hasCategories, categories, activeCategory]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = 300; // số pixel scroll mỗi lần
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Function để hiển thị trạng thái dựa trên CompletionStatus
  const getCompletionStatusText = (completionStatus) => {
    if (completionStatus === "Completed") {
      return "Đã ra trọn bộ";
    } else if (completionStatus === "Ongoing") {
      return "Đang phát hành";
    }
    return "Đang phát hành"; // Default
  };

  const getCompletionStatusColor = (completionStatus) => {
    if (completionStatus === "Completed") {
      return "bg-green-600";
    } else if (completionStatus === "Ongoing") {
      return "bg-orange-600";
    }
    return "bg-orange-600"; // Default
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {title !== "Gợi ý cho bạn" && (
          <Link
            to={
              title === "Sách nói chất lượng"
                ? "/audiobooks"
                : title === "Sách đọc hấp dẫn"
                ? "/stories"
                : "/books"
            }
            className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer whitespace-nowrap"
          >
            Xem thêm <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        )}
      </div>

      {/* Categories */}
      {hasCategories && categories && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Book list */}
      <div className="relative">
        {/* Nút trái */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
             bg-gray-800/80 hover:bg-gray-700 text-white 
             p-3 rounded-full shadow-lg"
        >
          <ChevronLeft size={32} /> {/* icon to hơn */}
        </button>

        {/* List */}
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {(filteredBooks || []).length === 0 ? (
            <div className="text-gray-400 text-sm px-2 py-1">
              Không có sách phù hợp.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/bookdetails/${book.id}`}
                className="flex-shrink-0 cursor-pointer group"
              >
                <div className="w-56">
                  {" "}
                  {/* ~224px */}
                  <div className="relative mb-3">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-80 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                    
                    {/* Trạng thái CompletionStatus - đè lên hình ảnh */}
                    {book.completionStatus && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs text-white rounded-full ${getCompletionStatusColor(book.completionStatus)} shadow-lg`}>
                          {getCompletionStatusText(book.completionStatus)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{book.author}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Nút phải */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
             bg-gray-800/80 hover:bg-gray-700 text-white 
             p-3 rounded-full shadow-lg"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}
