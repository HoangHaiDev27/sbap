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
  const [role, setRole] = useState("");
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
      <div className="flex flex-col flex-1 bg-gray-900 text-white lg:ml-64 overflow-x-hidden">
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
        <div className="flex gap-4 mt-4">
  <button
    onClick={() => setRole("staff")}
    className="px-4 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 shadow-md transition"
  >
    Staff
  </button>
  <button
    onClick={() => setRole("admin")}
    className="px-4 py-2 rounded-2xl bg-green-500 text-white hover:bg-green-600 shadow-md transition"
  >
    Admin
  </button>
  <button
    onClick={() => setRole("owner")}
    className="px-4 py-2 rounded-2xl bg-purple-500 text-white hover:bg-purple-600 shadow-md transition"
  >
    Owner
  </button>
  <button
    onClick={() => setRole("user")}
    className="px-4 py-2 rounded-2xl bg-gray-500 text-white hover:bg-gray-600 shadow-md transition"
  >
    User
  </button>
</div>

      </div>
      
    </div>
    
  );
}

export default App;
