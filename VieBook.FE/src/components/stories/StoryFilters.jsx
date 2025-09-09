'use client';

import { useState } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

export default function StoryFilters() {
  const [selectedGenre, setSelectedGenre] = useState('Tất cả thể loại');
  const [selectedDuration, setSelectedDuration] = useState('Tất cả thời lượng');
  const [selectedNarrator, setSelectedNarrator] = useState('Tất cả người kể');

  const genres = [
    'Tất cả thể loại',
    'Truyện tình cảm',
    'Truyện trinh thám',
    'Truyện kinh dị',
    'Truyện phiêu lưu',
    'Truyện cổ tích',
    'Truyện dân gian',
    'Truyện cười',
    'Truyện ngắn',
  ];

  const durations = [
    'Tất cả thời lượng',
    'Dưới 1 giờ',
    '1-3 giờ',
    '3-6 giờ',
    '6-10 giờ',
    'Trên 10 giờ',
  ];

  const narrators = [
    'Tất cả người kể',
    'Thanh Hương',
    'Minh Châu',
    'Hoàng Anh',
    'Thu Hà',
    'Quang Minh',
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Bộ lọc truyện nói
      </h2>

      {/* Thể loại */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Thể loại</label>
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-orange-500 appearance-none"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
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
        <button className="px-4 py-2 bg-orange-600 text-white rounded-full text-sm hover:bg-orange-700 transition-colors whitespace-nowrap">
          Mới nhất
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors whitespace-nowrap">
          Phổ biến nhất
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors whitespace-nowrap">
          Đánh giá cao
        </button>
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors whitespace-nowrap">
          Thời lượng ngắn
        </button>
      </div>
    </div>
  );
}
