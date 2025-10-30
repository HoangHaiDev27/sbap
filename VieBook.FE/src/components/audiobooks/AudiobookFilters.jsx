import React, { useEffect, useState } from "react";
import Select from "react-select";
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
  const sortOptions = ["Phổ biến", "Mới nhất", "Đang giảm giá", "Giá thấp đến cao", "Giá cao đến thấp", "A-Z", "Z-A"];
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    async function fetchFilters() {
      try {
        const books = (await getReadBooks()) || [];

        // categories
        const cleanCategories = books
        .flatMap((b) => {
          // Nếu API trả về dạng mảng: ["Tình cảm", "Hành động"]
          if (Array.isArray(b.categories)) {
            return b.categories.map((c) => c.toString().trim());
          }
          // Nếu API trả về dạng chuỗi "Tình cảm, Hành động"
          else if (typeof b.categories === "string") {
            return b.categories
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c !== "");
          }
          // Không có categories
          else {
            return [];
          }
        })
        .filter((c) => c !== ""); // loại bỏ chuỗi rỗng

      const uniqueCategories = Array.from(new Set(cleanCategories)).sort((a, b) =>
        a.localeCompare(b, "vi")
      );
        setCategories(["Tất cả", ...uniqueCategories]);

        // authors
        const cleanAuthors = books
          .map((b) => (b.author ?? "").toString().trim())
          .filter((a) => a !== "");
        const uniqueAuthors = Array.from(new Set(cleanAuthors)).sort((a, b) =>
          a.localeCompare(b, "vi")
        );
        setAuthors(["Tất cả", ...uniqueAuthors]);

        // reset nếu author không tồn tại
        if (selectedAuthor && !["Tất cả", ...uniqueAuthors].includes(selectedAuthor)) {
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
  }, []);

  // helper chuyển mảng string -> react-select options
  const toOptions = (arr) => arr.map((item) => ({ value: item, label: item }));

  // inline styles cho react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#374151", // bg-gray-700
      borderColor: state.isFocused ? "#f97316" : "#4b5563", // orange-500 khi focus
      borderRadius: "0.375rem", // rounded-md
      padding: "2px",
      minHeight: "40px",
      boxShadow: state.isFocused ? "0 0 0 2px #f97316" : "none",
      "&:hover": {
        borderColor: "#f97316",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff", // text-white
    }),
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
      color: "#fff",
      borderRadius: "0.375rem",
      overflow: "hidden",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f97316"
        : state.isFocused
        ? "#4b5563"
        : "#374151",
      color: "#fff",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af", // text-gray-400
    }),
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Bộ lọc sách đọc</h2>

      {/* Thể loại */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Thể loại</h3>
        <Select
          options={toOptions(categories)}
          value={{
            value: selectedCategory || "Tất cả",
            label: selectedCategory || "Tất cả",
          }}
          onChange={(option) => setSelectedCategory(option.value)}
          isSearchable
          styles={customSelectStyles}
          components={{ IndicatorSeparator: () => null }}   
        />
      </div>

      {/* Tác giả */}
      <div>
        <h3 className="block text-gray-300 text-sm mb-2">Tác giả</h3>
        <Select
            options={toOptions(authors)}
            value={{
              value: selectedAuthor || "Tất cả",
              label: selectedAuthor || "Tất cả",
            }}
            onChange={(option) => setSelectedAuthor(option.value)}
            isSearchable
            styles={customSelectStyles}
            components={{ IndicatorSeparator: () => null }}   
          />
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
              {Array.from({ length: 5 }, (_, i) => (i < stars ? "★" : "☆")).join(
                ""
              )}{" "}
              {stars} sao trở lên
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
