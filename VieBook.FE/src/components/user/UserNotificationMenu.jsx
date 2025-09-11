import React, { useState, useRef, useEffect } from "react";
import { RiNotification3Line } from "react-icons/ri";

function UserNotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const notifRef = useRef(null);

  const notifications = [
    { id: 1, text: "📚 Đơn hàng mới từ khách A" },
    { id: 2, text: "💬 Bình luận mới về sách" },
    { id: 3, text: "⭐ Sách của bạn được đánh giá 5 sao" },
  ];

  // 🔹 Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notifRef}>
      {/* Icon chuông */}
      <button
        className="relative hover:text-blue-400 transition-colors"
        onClick={() => setIsOpen((v) => !v)}
      >
        <RiNotification3Line className="text-2xl text-white" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 text-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-slate-600 font-semibold">
            Thông báo
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="px-4 py-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-none"
              >
                {n.text}
              </li>
            ))}
          </ul>
          <div className="p-2 text-center text-sm text-blue-400 hover:underline cursor-pointer">
            Xem tất cả
          </div>
        </div>
      )}
    </div>
  );
}

export default UserNotificationMenu;
