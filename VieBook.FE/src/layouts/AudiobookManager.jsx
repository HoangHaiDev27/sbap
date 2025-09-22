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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-6">
        <div className="mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
    {/* Tiêu đề + mô tả */}
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Sách đọc</h1>
      <p className="text-gray-400">
        Thưởng thức hàng nghìn sách đọc chất lượng cao với giao diện thân thiện
      </p>
    </div>

    {/* Nút Grid/List */}
    <div className="flex space-x-2 mt-4 md:mt-0">
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


        <div className="flex gap-8">
          {/* Filters */}
          <div className="w-64 flex-shrink-0">
            <AudiobookFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            // selectedDuration={selectedDuration}
            // setSelectedDuration={setSelectedDuration}
            selectedAuthor={selectedAuthor}          // 👈 truyền vào
            setSelectedAuthor={setSelectedAuthor} 
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
          />
          </div>

          {/* Grid */}
          <div className="flex-1">
            <AudiobookGrid
              selectedCategory={selectedCategory}
            //  selectedDuration={selectedDuration}
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
