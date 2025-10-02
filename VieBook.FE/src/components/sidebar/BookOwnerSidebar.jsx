import { Link, useNavigate } from "react-router-dom";
import useActiveMenu from "../../hooks/useActiveMenu";
import logo from "../../assets/logo.png";
import { switchRole, getCurrentRole } from "../../api/authApi";
import {
  RiDashboardLine,
  RiBook2Line,
  RiFileListLine,
  RiCoupon2Line,
  RiArticleLine,
  RiMessage3Line,
  RiFeedbackLine,
  RiUserLine,
} from "react-icons/ri";

export default function BookOwnerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleRoleSwitch = () => {
    // Chuyển từ owner sang customer
    console.log('Switching from owner to customer');
    const success = switchRole('customer');
    console.log('Switch result:', success);
    if (success) {
      navigate('/');
    } else {
      console.error('Failed to switch role');
    }
  };

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
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
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
        <nav className="px-4 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    pathname === item.href || activeMenu === item.id
                      ? "bg-orange-600 text-white"
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

        {/* Role Switch Button - chuyển về khách hàng - nằm dưới cùng */}
        <div className="px-4 pb-4">
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={handleRoleSwitch}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
            >
              <RiUserLine className="w-4 h-4" />
              <span>Chuyển sang khách hàng</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
