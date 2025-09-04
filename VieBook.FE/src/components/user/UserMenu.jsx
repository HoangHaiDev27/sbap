import React, { useState, useRef, useEffect } from "react";
import { RiUserLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token hoặc dữ liệu user
    navigate("/auth/login"); // Chuyển về trang login
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Icon user */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center hover:text-blue-400 transition-colors cursor-pointer"
      >
        <RiUserLine className="text-xl" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-50
                        transform transition-all duration-200 scale-95 opacity-0 animate-fadeIn"
        >
          <Link
            to="/customer"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            Thông tin tài khoản
          </Link>
          <Link
            to="/change-password"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            Đổi mật khẩu
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
