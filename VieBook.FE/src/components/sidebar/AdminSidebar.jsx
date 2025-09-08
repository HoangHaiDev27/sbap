// src/components/sidebar/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Thống kê", icon: "ri-dashboard-line", href: "/admin" },
    { id: "staff", label: "Quản lý Staff", icon: "ri-admin-line", href: "/admin/staff" },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Logo */}
      <div className="p-6">
        <Link to="/admin" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold font-['Pacifico']">VieBook</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap
                ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer link */}
      <div className="absolute bottom-6 left-4 right-4">
        <Link
          to="/"
          onClick={onClose}
          className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
        >
          <i className="ri-arrow-left-line mr-2 inline-flex items-center justify-center" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
