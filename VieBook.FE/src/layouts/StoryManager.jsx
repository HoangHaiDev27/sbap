'use client';

import { useState } from "react";
import StoryFilters from "../components/stories/StoryFilters";
import StoryGrid from "../components/stories/StoryGrid";

export default function StoryManager() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả thể loại");
  const [selectedDuration, setSelectedDuration] = useState("Tất cả thời lượng");
  const [selectedNarrator, setSelectedNarrator] = useState("Tất cả người kể");
  const [sortBy, setSortBy] = useState("Mới nhất");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sách Audio</h1>
          <p className="text-gray-400">
            Thưởng thức hàng nghìn sách audio chất lượng cao với giọng đọc chuyên nghiệp
          </p>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Bộ lọc */}
          <div className="w-64 flex-shrink-0">
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
          <div className="flex-1">
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
