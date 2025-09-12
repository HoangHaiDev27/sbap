import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Thống kê", icon: "ri-dashboard-line", href: "/admin" },
    { id: "staff", label: "Quản lý Staff", icon: "ri-admin-line", href: "/admin/staff" },
  ];

  return (
    <>
      {/* Overlay cho mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto z-50 shadow-lg transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
            <span className="text-2xl font-bold text-orange-500">VieBook</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="px-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={onClose}
                  >
                    <i className={`${item.icon} w-5 h-5 mr-3`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
