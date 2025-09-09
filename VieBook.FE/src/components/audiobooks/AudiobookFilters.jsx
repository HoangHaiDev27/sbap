import React from "react";
import { RiStarFill, RiStarLine } from "react-icons/ri";
// import PropTypes from "prop-types";

export default function AudiobookFilters({
  selectedCategory,
  setSelectedCategory,
  selectedDuration,
  setSelectedDuration,
  sortBy,
  setSortBy,
}) {
  const categories = [
    "Tất cả",
    "Văn học",
    "Truyện tranh",
    "Tiểu thuyết",
    "Tâm lý học",
    "Kinh doanh",
    "Lãng mạn",
    "Trinh thám",
    "Khoa học viễn tưởng",
    "Phiêu lưu",
    "Lịch sử",
    "Truyện cổ tích",
    "Hài hước",
  ];

  const durations = [
    "Tất cả",
    "Dưới 3 giờ",
    "3-6 giờ",
    "6-10 giờ",
    "10-15 giờ",
    "Trên 15 giờ",
  ];

  const sortOptions = [
    "Phổ biến",
    "Mới nhất",
    "Đánh giá cao",
    "Thời lượng ngắn",
    "Thời lượng dài",
    "A-Z",
    "Z-A",
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Thể loại */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Thể loại</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Thời lượng */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Thời lượng</h3>
        <div className="space-y-2">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                selectedDuration === duration
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Sắp xếp */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Sắp xếp</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-8"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Người kể */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Người kể</h3>
        <div className="space-y-2">
          {["Nguyễn Minh Hoàng", "Trần Thị Lan", "Lê Văn Nam", "Phạm Thị Hương"].map(
            (narrator) => (
              <label
                key={narrator}
                className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>{narrator}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Đánh giá */}
<div>
  <h3 className="font-semibold mb-3 text-orange-400">Đánh giá</h3>
  <div className="space-y-2">
    {[5, 4, 3, 2, 1].map((stars) => (
      <button
        key={stars}
        className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-colors"
      >
        <div className="flex">
          {[...Array(5)].map((_, i) =>
            i < stars ? (
              <RiStarFill key={i} className="text-yellow-400" />
            ) : (
              <RiStarLine key={i} className="text-gray-500" />
            )
          )}
        </div>
        <span>{stars} sao trở lên</span>
      </button>
    ))}
  </div>
</div>
    </div>
  );
}

// ✅ Khai báo PropTypes (JS)
// AudiobookFilters.propTypes = {
//   selectedCategory: PropTypes.string.isRequired,
//   setSelectedCategory: PropTypes.func.isRequired,
//   selectedDuration: PropTypes.string.isRequired,
//   setSelectedDuration: PropTypes.func.isRequired,
//   sortBy: PropTypes.string.isRequired,
//   setSortBy: PropTypes.func.isRequired,
// };
