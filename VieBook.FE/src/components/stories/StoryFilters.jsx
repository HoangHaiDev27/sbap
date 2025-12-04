'use client';

import { useEffect, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { getAudioBooks } from "../../api/audioBookApi";

export default function StoryFilters({
  selectedCategory,
  setSelectedCategory,
  selectedDuration,
  setSelectedDuration,
  selectedNarrator,
  setSelectedNarrator,
  sortBy,
  setSortBy,
}) {
  const [categories, setCategories] = useState(["Tất cả thể loại"]);
  const [narrators, setNarrators] = useState(["Tất cả người kể"]);

  const durations = [
    "Tất cả thời lượng",
    "Dưới 1 giờ",
    "1-3 giờ",
    "3-6 giờ",
    "6-10 giờ",
    "Trên 10 giờ",
  ];

  // --- Fetch categories và narrators từ API ---
  useEffect(() => {
  async function fetchData() {
    try {
      const books = await getAudioBooks();

      // ✅ Lấy tất cả categories, dù là mảng hay chuỗi
      const allCategories = books.flatMap((b) => 
        Array.isArray(b.categories)
          ? b.categories
          : b.categories ? [b.categories] : []
      );

      const uniqueCategories = Array.from(
        new Set(allCategories.filter((c) => c && c.trim() !== ""))
      );
      setCategories(["Tất cả thể loại", ...uniqueCategories]);

      // ✅ Lấy tất cả người kể
      const uniqueNarrators = Array.from(
        new Set(
          books
            .map((b) => b.narrator)
            .filter((n) => n && n.trim() !== "")
        )
      );
      setNarrators(["Tất cả người kể", ...uniqueNarrators]);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }
  fetchData();
}, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Bộ lọc
      </h2>

      {/* Thể loại */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Thể loại</label>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-orange-500 appearance-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <RiArrowDownSLine className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Thời lượng */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Thời lượng</label>
        <div className="relative">
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-orange-500 appearance-none"
          >
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
          <RiArrowDownSLine className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Người kể */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Người kể</label>
        <div className="relative">
          <select
            value={selectedNarrator}
            onChange={(e) => setSelectedNarrator(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-orange-500 appearance-none"
          >
            {narrators.map((narrator) => (
              <option key={narrator} value={narrator}>
                {narrator}
              </option>
            ))}
          </select>
          <RiArrowDownSLine className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Các nút sắp xếp */}
      <div className="flex flex-wrap gap-3 mt-6">
        {["Mới nhất", "Phổ biến nhất", "Đánh giá cao", "Thời lượng ngắn", "Đang khuyến mãi"].map(
          (option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap ${
                sortBy === option
                  ? "bg-orange-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {option === "Đang khuyến mãi" && "🔥 "}
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
}