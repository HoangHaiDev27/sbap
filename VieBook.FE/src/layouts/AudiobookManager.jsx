import React, { useState } from "react";
import AudiobookFilters from "../components/audiobooks/AudiobookFilters";
import AudiobookGrid from "../components/audiobooks/AudiobookGrid";
import { RiGridLine, RiListCheck } from "react-icons/ri";

export default function AudiobookManager() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
 // const [selectedDuration, setSelectedDuration] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Phổ biến");
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAuthor, setSelectedAuthor] = useState("Tất cả");

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tiêu đề + mô tả */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sách đọc</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Thưởng thức hàng nghìn sách đọc chất lượng cao với giao diện thân thiện
              </p>
            </div>

            {/* Nút Grid/List */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
              >
                {showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}
              </button>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setViewMode("grid")} 
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
                >
                  <RiGridLine className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode("list")} 
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
                >
                  <RiListCheck className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <AudiobookFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedAuthor={selectedAuthor}
              setSelectedAuthor={setSelectedAuthor} 
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <AudiobookGrid
              selectedCategory={selectedCategory}
              selectedAuthor={selectedAuthor} 
              selectedRating={selectedRating}
              sortBy={sortBy}
              viewMode={viewMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
