import { Link } from "react-router-dom";
import useActiveMenu from "../../hooks/useActiveMenu";
import logo from "../../assets/logo.png";
import {
  RiDashboardLine,
  RiBook2Line,
  RiFileListLine,
  RiCoupon2Line,
  RiArticleLine,
  RiMessage3Line,
  RiFeedbackLine,
} from "react-icons/ri";

export default function BookOwnerSidebar({ isOpen, onClose }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: RiDashboardLine, href: "/owner/dashboard" },
    { id: "books", label: "Quản lý Sách", icon: RiBook2Line, href: "/owner/books" },
    { id: "sales", label: "Lịch sử bán hàng", icon: RiFileListLine, href: "/owner/sales-history" },
    { id: "promotion", label: "Quản lý Khuyến mãi", icon: RiCoupon2Line, href: "/owner/promotions" },
    { id: "articles", label: "Quản lý Bài viết", icon: RiArticleLine, href: "/owner/articles" },
    { id: "chat", label: "Chat với Staff", icon: RiMessage3Line, href: "/owner/chat" },
    { id: "feedback", label: "Đánh giá & phản hồi", icon: RiFeedbackLine, href: "/owner/feedback" },
  ];

  const { activeMenu, setActiveMenu, pathname } = useActiveMenu(menuItems);

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white shadow-lg z-50 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link
            to="/owner/dashboard"
            className="flex items-center space-x-3"
            onClick={onClose}
          >
            <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
            <span className="text-2xl font-bold text-orange-500">VieBook</span>
          </Link>
        </div>

        {/* Menu chính */}
        <nav className="px-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    pathname === item.href || activeMenu === item.id
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveMenu(item.id);
                    onClose && onClose();
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
