import React from "react";
import { RiArrowLeftLine, RiFileTextLine, RiFullscreenLine, RiFullscreenExitLine } from "react-icons/ri";
import { Link } from "react-router-dom";

export default function PlayerHeader({ book, bookId, isFullscreen, toggleFullscreen, toggleTranscript }) {
  return (
    <header className="bg-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Link
          to={`/bookdetails/${bookId}`}
          className="text-orange-500 hover:text-orange-400 transition-colors"
        >
          <RiArrowLeftLine className="text-xl" />
        </Link>
        <div>
          <h1 className="font-semibold">{book.title}</h1>
          <p className="text-sm text-gray-400">{book.narrator}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* <button
          onClick={toggleTranscript}
          className="p-2 rounded-lg hover:bg-gray-700"
          title="Bản ghi âm"
        >
          <RiFileTextLine className="w-5 h-5" />
        </button> */}

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-700"
          title="Toàn màn hình"
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
