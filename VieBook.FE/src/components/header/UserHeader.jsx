import { useState } from "react";
import { Link } from "react-router-dom";
import {
  RiMenuLine,
  RiSearchLine,
  RiBookmarkLine,
  RiShoppingCartLine,
  RiUserLine,
} from "react-icons/ri";
import UserMenu from "../user/UserMenu";

export default function UserHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Nút menu mobile */}
        <button
          className="lg:hidden w-6 h-6 flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
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
              placeholder="Tìm kiếm"
              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Icon bên phải */}
        <div className="flex items-center space-x-4">
          <Link
            to="/wishlist"
            className="w-6 h-6 flex items-center justify-center hover:text-blue-400 transition-colors cursor-pointer"
          >
            <RiBookmarkLine className="text-xl" />
          </Link>

          <Link
            to="/cart"
            className="w-6 h-6 flex items-center justify-center hover:text-blue-400 transition-colors cursor-pointer relative"
          >
            <RiShoppingCartLine className="text-xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
