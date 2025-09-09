'use client';

import {
  RiStarFill,
  RiStarLine,
} from 'react-icons/ri';

export default function BookFilters({
  selectedCategory,
  setSelectedCategory,
  selectedFormat,
  setSelectedFormat,
  sortBy,
  setSortBy
}) {
  const categories = [
    'Tất cả',
    'Văn học',
    'Kinh doanh',
    'Tâm lý học',
    'Khoa học',
    'Lịch sử',
    'Tiểu thuyết',
    'Trinh thám',
    'Lãng mạn',
    'Phiêu lưu'
  ];

  const formats = [
    'Tất cả',
    'Sách điện tử',
    'Sách nói',
    'Cả hai'
  ];

  const sortOptions = [
    'Phổ biến',
    'Mới nhất',
    'Đánh giá cao',
    'A-Z',
    'Z-A'
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Thể loại */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Thể loại</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Định dạng */}
      <div>
        <h3 className="font-semibold mb-3 text-orange-400">Định dạng</h3>
        <div className="space-y-2">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                selectedFormat === format
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {format}
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
                    <RiStarFill
                      key={i}
                      className="text-yellow-400"
                    />
                  ) : (
                    <RiStarLine
                      key={i}
                      className="text-gray-500"
                    />
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
