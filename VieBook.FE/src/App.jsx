import React, { useEffect, useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import ReaderManager from "./layouts/ReaderManager";
import PlayerManager from "./layouts/PlayerManager";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
import { useCoinsStore } from "./hooks/stores/coinStore";
import { getRole, getUserId, getCurrentRole } from "./api/authApi";
import Toast from "./components/common/Toast";
import { Toaster } from "react-hot-toast";
function App() {
  const location = useLocation();
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const noLayoutRoutes = ["/auth","/auth/verify-email","/access-denied"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const fetchCoins = useCoinsStore((state) => state.fetchCoins);
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchCoins(userId);
    }
    const r = getCurrentRole();
    if (r) setRole(String(r).toLowerCase());
    const onAuthChanged = (e) => {
      const { role: newRole, user } = e.detail || {};
      if (newRole) {
        setRole(String(newRole).toLowerCase());
      } else {
        // Nếu không có role trong event, lấy từ localStorage
        const currentRole = getCurrentRole();
        if (currentRole) {
          setRole(String(currentRole).toLowerCase());
        }
      }
      // Fetch coins when user logs in
      if (user) {
        const userId = user.userId || user.UserId || user.id || user.Id;
        console.log("App - Auth changed, user:", user, "userId:", userId);
        if (userId) {
          fetchCoins(userId);
        }
      } else {
        // If user is null (logout), reset coins
        console.log("App - User logged out, resetting coins");
        useCoinsStore.getState().setCoins(0);
      }
    };
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [fetchCoins]);
  if (hideLayout) {
    return (
      <>
        <AppRoutes />
        <Toast />   {/* ✅ luôn render toast */}
      </>
    );
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
        <Toast />
        
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
