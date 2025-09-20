import React, { useEffect, useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import ReaderManager from "./layouts/ReaderManager";
import PlayerManager from "./layouts/PlayerManager";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
import { useCoinsStore } from "./hooks/stores/coinStore";
import { getRole, getUserId } from "./api/authApi";
import { Toaster } from "react-hot-toast";
function App() {
  const location = useLocation();
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const noLayoutRoutes = ["/auth","/auth/verify-email"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const fetchCoins = useCoinsStore((state) => state.fetchCoins);
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchCoins(userId);
    }
    const r = getRole();
    if (r) setRole(String(r).toLowerCase());
    const onAuthChanged = (e) => {
      const { role: newRole } = e.detail || {};
      if (newRole) setRole(String(newRole).toLowerCase());
    };
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [fetchCoins]);
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
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            style: {
              background: '#059669',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
        }}
      />
    </div>
    
  );
}

export default App;
