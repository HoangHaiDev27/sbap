import React, { useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import ReaderManager from "./layouts/ReaderManager";
import PlayerManager from "./layouts/PlayerManager";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
function App() {
  const location = useLocation();
  const [role, setRole] = useState("user");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const noLayoutRoutes = ["/auth"];

  const hideLayout = noLayoutRoutes.includes(location.pathname);

  if (hideLayout) {
    //  Chỉ render nội dung route, không layout
    return <AppRoutes />;
  }
  // Kiểm tra layout đặc biệt
  const isReaderPage = location.pathname.startsWith("/reader");
  const isPlayerPage = location.pathname.startsWith("/player");

  // Nếu là trang Reader
  if (isReaderPage) {
    return (
      <ReaderManager>
        <AppRoutes />
      </ReaderManager>
    );
  }

  // Nếu là trang Player
  if (isPlayerPage) {
    return (
      <PlayerManager>
        <AppRoutes />
      </PlayerManager>
    );
  }

  // Layout mặc định cho tất cả các trang khác
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SidebarManager
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main layout */}
      <div className="flex flex-col flex-1 bg-gray-900 text-white lg:ml-64">
        {/* Header */}
        <HeaderManager
          role={role}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

        {/* Main content */}
        <main className="flex-1">
          <AppRoutes />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
