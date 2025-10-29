import React from "react";
import { RiArrowLeftLine, RiFileTextLine, RiFullscreenLine, RiFullscreenExitLine } from "react-icons/ri";
import { Link } from "react-router-dom";

export default function AudioPlayerHeader({ book, bookId, isFullscreen, toggleFullscreen, toggleTranscript }) {
  return (
    <header className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-700">
      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
        <Link
          to={`/bookdetails/${bookId}`}
          className="text-blue-500 hover:text-blue-400 transition-colors flex-shrink-0"
          title="Quay lại"
        >
          <RiArrowLeftLine className="text-xl md:text-2xl" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-base md:text-lg truncate">{book.title}</h1>
          <p className="text-xs md:text-sm text-gray-400 truncate">{book.narrator || book.author}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        >
          {isFullscreen ? (
            <RiFullscreenExitLine className="w-5 h-5" />
          ) : (
            <RiFullscreenLine className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}

