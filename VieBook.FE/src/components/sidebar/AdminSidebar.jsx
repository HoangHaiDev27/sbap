// src/components/sidebar/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png"; // ⚡ chỉnh lại path cho đúng

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
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
          <span className="text-2xl font-bold text-orange-500">VieBook</span>
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
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
