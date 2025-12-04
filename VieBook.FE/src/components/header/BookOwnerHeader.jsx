import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import {
  RiMenuLine,
  RiSearchLine,
  RiNotification3Line,
} from "react-icons/ri";

export default function BookOwnerHeader({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // giả sử số dư lấy từ API
  const [balance] = useState(1250000); // VND
  const coins = Math.floor(balance / 1000); // 1000 = 1 coin

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Nút menu mobile */}
        <button
          className="lg:hidden w-6 h-6 flex items-center justify-center"
          onClick={onToggleSidebar}
        >
          <RiMenuLine className="text-xl" />
        </button>

        {/* Ô tìm kiếm */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-6">
          <div
            className={`relative flex items-center bg-gray-600 rounded-lg transition-all w-full ${
              isSearchFocused ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <RiSearchLine className="text-gray-300 ml-3" />
            <input
              type="text"
              placeholder="Tìm kiếm sách nhanh..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Icon bên phải */}
        <div className="flex items-center space-x-6">
          {/* Thông báo */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative hover:text-blue-400 transition-colors"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <RiNotification3Line className="text-2xl" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                5
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-gray-600 font-semibold">
                  Thông báo
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  <li className="px-4 py-2 hover:bg-slate-600 cursor-pointer">
                    📚 Đơn hàng mới từ khách A
                  </li>
                  <li className="px-4 py-2 hover:bg-slate-600 cursor-pointer">
                    💬 Bình luận mới về sách
                  </li>
                  <li className="px-4 py-2 hover:bg-slate-600 cursor-pointer">
                    ⭐ Sách của bạn được đánh giá 5 sao
                  </li>
                </ul>
                <div className="p-2 text-center text-sm text-blue-400 hover:underline cursor-pointer">
                  Xem tất cả
                </div>
              </div>
            )}
          </div>

          {/* Avatar user */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-sm font-semibold hover:opacity-90 transition"
            >
              TH
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-600">
                  <div className="text-sm text-gray-300">Số dư của bạn</div>
                  <div className="text-lg font-bold text-green-400">
                    {coins} Coin
                  </div>
                  <div className="text-xs text-gray-400">
                    (~ {balance.toLocaleString("vi-VN")} đ)
                  </div>
                </div>

                {/* <Link
                  to="/owner/profile/overview"
                  className="block px-4 py-2 text-sm hover:bg-slate-600"
                >
                  Hồ sơ của tôi
                </Link>
                <Link
                  to="/owner/profile/settings/personal"
                  className="block px-4 py-2 text-sm hover:bg-slate-600"
                >
                  Cài đặt
                </Link> */}
                <Link
                  to="/owner/withdraw"
                  className="block px-4 py-2 text-sm text-green-400 hover:bg-slate-600"
                >
                  💵 Yêu cầu rút tiền
                </Link>
                <button onClick={async ()=>{ await logout(); navigate('/auth'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-600 text-red-400">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}