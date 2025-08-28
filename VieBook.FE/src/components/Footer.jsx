import React from "react";
import { Link } from "react-router-dom";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiYoutubeFill,
  RiMessageFill,
} from "react-icons/ri";
import logo from "../assets/logo.png"; // ⚡ nhớ import ảnh logo

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Grid chia 3 phần, responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo + Thông tin công ty */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-[1.5em] w-auto scale-300"
              />
              <span className="text-2xl font-bold text-orange-500">
                VieBook
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="font-semibold text-white">
                SMART BOOK AUDIO PLATFORM
              </p>
              <p>0345 510 055</p>
              <p>support@wewe.vn</p>
              <p>FPT University, Da Nang</p>
            </div>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="font-bold text-white mb-4">CHÍNH SÁCH</h3>
            <div className="space-y-2 text-sm">
              <Link
                to="/terms"
                className="block text-gray-300 hover:text-white cursor-pointer"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                to="/privacy"
                className="block text-gray-300 hover:text-white cursor-pointer"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/security"
                className="block text-gray-300 hover:text-white cursor-pointer"
              >
                Bảo mật thông tin
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-white mb-4">KẾT NỐI VỚI CHÚNG TÔI</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              >
                <RiFacebookFill size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-pink-600 rounded-full hover:bg-pink-700 transition-colors"
              >
                <RiInstagramLine size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              >
                <RiYoutubeFill size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              >
                <RiMessageFill size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2025 VieBook. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
