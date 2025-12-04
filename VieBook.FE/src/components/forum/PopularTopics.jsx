import React from "react";
import { RiFireLine, RiArrowRightSLine } from "react-icons/ri";

export default function PopularTopics({ topics, onTagClick }) {
  const handleTagClick = (tagName) => {
    if (onTagClick) {
      onTagClick(tagName);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <RiFireLine className="text-orange-500" size={20} />
        <h3 className="font-semibold text-white">Chủ đề nổi bật</h3>
      </div>
      
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div
            key={index}
            onClick={() => handleTagClick(topic.name)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-750 cursor-pointer transition-colors group"
          >
            <div className={`w-3 h-3 rounded-full ${topic.color}`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate group-hover:text-orange-400 transition-colors">
                #{topic.name}
              </p>
              <p className="text-slate-400 text-xs">{topic.count}</p>
            </div>
            <RiArrowRightSLine className="text-slate-500 group-hover:text-orange-400 transition-colors" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}