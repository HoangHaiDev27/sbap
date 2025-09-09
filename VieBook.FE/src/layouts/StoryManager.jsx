'use client';

import { useState } from 'react';
import StoryFilters from '../components/stories/StoryFilters';
import StoryGrid from '../components/stories/StoryGrid';

export default function StoryManager() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả thể loại');
  const [selectedDuration, setSelectedDuration] = useState('Tất cả thời lượng');
  const [selectedNarrator, setSelectedNarrator] = useState('Tất cả người kể');
  const [sortBy, setSortBy] = useState('Mới nhất');

  return (
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
  );
}
