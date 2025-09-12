import { useState } from "react";
import { Link } from "react-router-dom";
import { RiMenuLine, RiSearchLine, RiBookmarkLine } from "react-icons/ri";

export default function GuestHeader({ onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Nút menu mobile */}
        <button
          className="lg:hidden w-6 h-6 flex items-center justify-center"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            onToggleSidebar && onToggleSidebar();
          }}
        >
          <RiMenuLine className="text-xl" />
        </button>

        {/* Ô tìm kiếm */}
        <div className="flex-1 max-w-md mx-4">
          <div
            className={`relative flex items-center bg-gray-800 rounded-lg transition-all ${
              isSearchFocused ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <RiSearchLine className="text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Icon + Login button */}
        <div className="flex items-center space-x-4">
          <Link
            to="/auth"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
            Login
            </Link>

        </div>
      </div>
    </header>
  );
}
