import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuLine, RiSearchLine } from "react-icons/ri";
import UserMenu from "../user/UserMenu";
import UserNotificationMenu from "../user/UserNotificationMenu";
import UserWishlistIcon from "../user/UserWishlistIcon";
import { useSearch } from "../../hooks/useSearch";

export default function UserHeader({ onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { query, setQuery, results, loading } = useSearch();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show search dropdown when there are results or loading
  useEffect(() => {
    setIsSearchOpen(query && (loading || results.length > 0));
  }, [query, loading, results]);

  const handleBookClick = (bookId) => {
    navigate(`/bookdetails/${bookId}`);
    setQuery("");
    setIsSearchOpen(false);
  };
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

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sách"
            className="w-full bg-gray-800 px-3 py-2 text-sm rounded-lg focus:outline-none"
          />

          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 bg-slate-700 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-sm text-gray-300">
                  Đang tìm kiếm...
                </div>
              ) : results.length > 0 ? (
                results.map((book) => (
                  <div
                    key={book.bookId}
                    onClick={() => handleBookClick(book.bookId)}
                    className="px-4 py-3 text-sm hover:bg-slate-600 cursor-pointer flex items-center space-x-3"
                  >
                    {/* Book Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={book.coverImageUrl || `https://via.placeholder.com/80x112/374151/ffffff?text=${encodeURIComponent(book.title?.charAt(0) || 'B')}`}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/80x112/374151/ffffff?text=${encodeURIComponent(book.title?.charAt(0) || 'B')}`;
                        }}
                      />
                    </div>
                    
                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {book.title}
                      </div>
                      <div className="text-gray-300 text-xs truncate">
                        {book.author || 'Tác giả không xác định'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-400">
                  Không có sách phù hợp
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icon bên phải */}
        <div className="flex items-center space-x-4">
          <UserWishlistIcon />
          <UserNotificationMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
