import { Link } from "react-router-dom";
import useActiveMenu from "../../hooks/useActiveMenu";
import logo from "../../assets/logo.png";
import {
  RiHomeLine,
  RiVipCrownLine,
  RiBook2Line,
  RiTrophyLine,
  RiHeadphoneLine,
  RiChat3Line,
  RiBookOpenLine,
  RiBookReadLine,
} from "react-icons/ri";

export default function ClientSidebar({ isOpen, onClose }) {
  const menuItems = [
    { id: "home", label: "Trang chủ", icon: RiHomeLine, href: "/" },
    { id: "vip", label: "Mua gói VIP", icon: RiVipCrownLine, href: "/vip" },
    { id: "library", label: "Thư viện", icon: RiBook2Line, href: "/library" },
    {
      id: "ranking",
      label: "Bảng xếp hạng",
      icon: RiTrophyLine,
      href: "/ranking",
    },
    {
      id: "listening",
      label: "Đang nghe",
      icon: RiHeadphoneLine,
      href: "/listening",
    },
    { id: "forum", label: "Diễn đàn sách", icon: RiChat3Line, href: "/forum" },
    {
      id: "audiobook",
      label: "Sách nói",
      icon: RiBookOpenLine,
      href: "/audiobooks",
    },
    {
      id: "story",
      label: "Truyện nói",
      icon: RiBookReadLine,
      href: "/stories",
    },
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
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto z-50 shadow-lg transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      {/* logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
          <span className="text-2xl font-bold text-orange-500">VieBook</span>
        </Link>
      </div>

      {/* menu */}
      <nav className="px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  pathname === item.href || activeMenu === item.id
                    ? "bg-orange-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setActiveMenu(item.id)}
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
