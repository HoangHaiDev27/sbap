import React, { useEffect, useState } from "react";
import { getReadBooks } from "../../api/bookApi";

export default function AudiobookFilters({
  selectedCategory,
  setSelectedCategory,
  selectedAuthor,
  setSelectedAuthor,
  sortBy,
  setSortBy,
  selectedRating,
  setSelectedRating,
}) {
  const [categories, setCategories] = useState(["Tất cả"]);
  const [authors, setAuthors] = useState(["Tất cả"]);

  const sortOptions = ["Phổ biến", "Mới nhất", "A-Z", "Z-A"];
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    async function fetchFilters() {
      try {
        const books = await getReadBooks() || [];

        // lấy, trim và loại null/empty
        const cleanCategories = books
          .map((b) => (b.category ?? "").toString().trim())
          .filter((c) => c !== "");

        const uniqueCategories = Array.from(new Set(cleanCategories)).sort((a,b) => a.localeCompare(b, 'vi'));
        setCategories(["Tất cả", ...uniqueCategories]);

        // authors
        const cleanAuthors = books
          .map((b) => (b.author ?? "").toString().trim())
          .filter((a) => a !== "");

        const uniqueAuthors = Array.from(new Set(cleanAuthors)).sort((a,b) => a.localeCompare(b, 'vi'));
        setAuthors(["Tất cả", ...uniqueAuthors]);

        // nếu selectedAuthor hiện tại không nằm trong danh sách mới -> reset về "Tất cả"
        if (selectedAuthor && !["Tất cả", ...uniqueAuthors].includes(selectedAuthor)) {
          // bảo đảm setSelectedAuthor tồn tại
          if (typeof setSelectedAuthor === "function") {
            setSelectedAuthor("Tất cả");
          }
        }
      } catch (error) {
        console.error("Failed to fetch filters", error);
      }
    }
    fetchFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // không thêm setSelectedAuthor vào deps để tránh loop; nếu cần thêm, xử lý khác

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
          {categories.map((category, idx) => (
            <option key={`${category}-${idx}`} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Tác giả */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Tác giả</h3>
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {authors.map((author, idx) => (
            <option key={`${author}-${idx}`} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

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
              {Array.from({ length: 5 }, (_, i) => (i < stars ? "★" : "☆")).join("")} {stars} sao trở lên
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
