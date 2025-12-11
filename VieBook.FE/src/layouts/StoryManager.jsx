'use client';

import { useState } from "react";
import StoryFilters from "../components/stories/StoryFilters";
import StoryGrid from "../components/stories/StoryGrid";

export default function StoryManager() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả thể loại");
  const [selectedDuration, setSelectedDuration] = useState("Tất cả thời lượng");
  const [selectedNarrator, setSelectedNarrator] = useState("Tất cả người kể");
  const [sortBy, setSortBy] = useState("Mới nhất");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sách Audio</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Thưởng thức hàng nghìn sách audio chất lượng cao với giọng đọc chuyên nghiệp
              </p>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm self-start"
            >
              {showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Bộ lọc */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <StoryFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              selectedNarrator={selectedNarrator}
              setSelectedNarrator={setSelectedNarrator}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Lưới truyện */}
          <div className="flex-1 min-w-0">
            <StoryGrid
              selectedCategory={selectedCategory}
              selectedDuration={selectedDuration}
              selectedNarrator={selectedNarrator}
              sortBy={sortBy}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
