import SidebarManager from "../layouts/SidebarManager";
import HeaderManager from "../layouts/HeaderManager";
import Footer from "../components/Footer";

export default function OwnerLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarManager role="owner" />

      {/* Main */}
      <div className="flex-1 flex flex-col ml-64 bg-gray-900 text-white">
        <HeaderManager role="owner" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
