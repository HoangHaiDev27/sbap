'use client';

import { useState } from 'react';
import { FaBookOpen } from 'react-icons/fa';
import BookGrid from "../components/bookdetails/BookGrid";
import BookFilters from "../components/bookdetails/BookFilters";

export default function BookDetailManager() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Phổ biến');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FaBookOpen className="text-orange-400" />
          Khám phá sách
        </h1>
        <p className="text-gray-400">
          Tìm kiếm và khám phá hàng nghìn cuốn sách yêu thích
        </p>
      </div>

      {/* Bộ lọc + Grid */}
      <div className="flex gap-8">
        {/* Bộ lọc */}
        <div className="w-64 flex-shrink-0">
          <BookFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Grid sách */}
        <div className="flex-1">
          <BookGrid
            selectedCategory={selectedCategory}
            selectedFormat={selectedFormat}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  );
}
