import React, { useEffect, useState } from "react";
import { getReadBooks } from "../../api/bookApi";

export default function AudiobookFilters({
  selectedCategory,
  setSelectedCategory,
 // selectedDuration,
 // setSelectedDuration,
  sortBy,
  setSortBy,
  selectedRating,
  setSelectedRating,
}) {
  const [categories, setCategories] = useState(["Tất cả"]);

  // const durations = [
  //   "Tất cả",
  //   "Dưới 3 giờ",
  //   "3-6 giờ",
  //   "6-10 giờ",
  //   "10-15 giờ",
  //   "Trên 15 giờ",
  // ];

  const sortOptions = [
    "Phổ biến",
    "Mới nhất",
    //"Đánh giá cao",
    // "Thời lượng ngắn",
    // "Thời lượng dài",
    "A-Z",
    "Z-A",
  ];

  const ratings = [5, 4, 3, 2, 1];

  // --- Lấy danh sách category từ API ---
  useEffect(() => {
    async function fetchCategories() {
      try {
        const books = await getReadBooks();
        const uniqueCategories = Array.from(
          new Set(books.map((b) => b.category))
        );
        setCategories(["Tất cả", ...uniqueCategories]);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Bộ lọc sách đọc</h2>

      {/* Thể loại */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Thể loại</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Thời lượng */}
      {/* <div>
        <h3 className="block text-gray-300 text-sm mb-2">Thời lượng</h3>
        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {durations.map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>
      </div> */}

      {/* Sắp xếp */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Sắp xếp</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Đánh giá */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Đánh giá</h3>
        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(Number(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value={0}>Tất cả</option>
          {ratings.map((stars) => (
            <option key={stars} value={stars}>
              {Array.from({ length: 5 }, (_, i) => (i < stars ? "★" : "☆")).join("")}{" "}
              {stars} sao trở lên
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
