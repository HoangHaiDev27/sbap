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
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

export default function BookOwnerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleRoleSwitch = () => {
    const success = switchRole("customer");
    if (success) {
      navigate("/");
    }
  };

  const getSwitchButtonText = () => "Chuyển sang khách hàng";

  const getSwitchButtonIcon = () => <RiUserLine className="w-4 h-4" />;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: RiDashboardLine, href: "/owner/dashboard" },
    { id: "books", label: "Quản lý Sách", icon: RiBook2Line, href: "/owner/books" },
    { id: "sales", label: "Lịch sử bán hàng", icon: RiFileListLine, href: "/owner/sales-history" },
    { id: "promotion", label: "Quản lý Khuyến mãi", icon: RiCoupon2Line, href: "/owner/promotions" },
    { id: "articles", label: "Quản lý Bài viết", icon: RiArticleLine, href: "/owner/articles" },
    { id: "withdrawal", label: "Rút tiền", icon: RiMoneyDollarCircleLine, href: "/owner/withdraw" },
    { id: "chat", label: "Nhân viên hỗ trợ", icon: RiMessage3Line, href: "/owner/chat" },
    { id: "feedback", label: "Đánh giá & phản hồi", icon: RiFeedbackLine, href: "/owner/feedback" },
  ];

  const { activeMenu, setActiveMenu, pathname } = useActiveMenu(menuItems);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white shadow-lg z-50 transform transition-transform duration-200 
        lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
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

        {/* Menu */}
        <nav className="px-4 flex-1">
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-4 rounded-lg transition-colors whitespace-nowrap ${
                    pathname === item.href || activeMenu === item.id
                      ? "bg-orange-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveMenu(item.id);
                    onClose && onClose();
                  }}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Role Switch Button */}
        <div className="px-4 pb-4">
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={handleRoleSwitch}
              className="w-full flex items-center space-x-3 px-4 py-4 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              {getSwitchButtonIcon()}
              <span className="font-medium">{getSwitchButtonText()}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}