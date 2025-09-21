import React, { useState, useRef, useEffect } from "react";
import { RiUserLine, RiAddLine, RiCoinLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { logout } from "../../api/authApi";

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
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };
  // Lấy số đồng xu hiện tại
  const coins = useCoinsStore((state) => state.coins);
  
  // Debug logging
  console.log("UserMenu - Current coins:", coins);
  
  // Theo dõi thay đổi coins
  useEffect(() => {
    console.log("UserMenu - Coins changed to:", coins);
  }, [coins]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Icon user */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center hover:text-blue-400 transition-colors cursor-pointer"
      >
        <RiUserLine className="text-xl text-white" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-slate-800 text-white shadow-lg rounded-md border border-slate-700 z-50
                     transform transition-all duration-200 scale-95 opacity-0 animate-fadeIn"
        >
          {/* Đồng xu */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RiCoinLine className="text-yellow-400 w-5 h-5" />
                <span className="text-sm font-medium text-yellow-400">
                  {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
                </span>
              </div>
              <button 
                onClick={() => {
                  navigate("/recharge");
                  setOpen(false);
                }}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <RiAddLine className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <Link
            to="/customer"
            className="block px-4 py-2 hover:bg-slate-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            Thông tin tài khoản
          </Link>
          {/* <Link
            to="/change-password"
            className="block px-4 py-2 hover:bg-slate-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            Đổi mật khẩu
          </Link> */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
