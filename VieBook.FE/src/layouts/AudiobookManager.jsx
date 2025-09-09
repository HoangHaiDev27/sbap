import React, { useState } from "react";
import AudiobookFilters from "../components/audiobooks/AudiobookFilters";
import AudiobookGrid from "../components/audiobooks/AudiobookGrid";

export default function AudiobookManager() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedDuration, setSelectedDuration] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Phổ biến");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sách nói và truyện nói</h1>
          <p className="text-gray-400">
            Thưởng thức hàng nghìn sách nói chất lượng cao với giọng đọc chuyên nghiệp
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters */}
          <div className="w-64 flex-shrink-0">
            <AudiobookFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Grid */}
          <div className="flex-1">
            <AudiobookGrid
              selectedCategory={selectedCategory}
              selectedDuration={selectedDuration}
              sortBy={sortBy}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
