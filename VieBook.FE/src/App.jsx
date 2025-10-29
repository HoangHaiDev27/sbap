import React, { useEffect, useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import ReaderManager from "./layouts/ReaderManager";
import PlayerManager from "./layouts/PlayerManager";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
import { useCoinsStore } from "./hooks/stores/coinStore";
import { useUserStore } from "./hooks/stores/userStore";
import { getRole, getUserId, getCurrentRole } from "./api/authApi";
import Toast from "./components/common/Toast";
import { Toaster } from "react-hot-toast";
function App() {
  const location = useLocation();
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authKey, setAuthKey] = useState(0); // Force re-render key
  const noLayoutRoutes = ["/auth", "/auth/verify-email", "/access-denied"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const fetchCoins = useCoinsStore((state) => state.fetchCoins);
  const fetchUser = useUserStore((state) => state.fetchUser);
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchCoins(userId);
      fetchUser(); // Initialize user data
    }
    const r = getCurrentRole();
    if (r) setRole(String(r).toLowerCase());
    
    const onAuthChanged = (e) => {
      const { role: newRole, user } = e.detail || {};
      console.log("App - Auth changed event:", e.detail);
      console.log("App - Current role before change:", role);
      
      if (newRole !== undefined && newRole !== null) {
        console.log("App - Setting role from event:", newRole);
        setRole(String(newRole).toLowerCase());
      } else {
        // Nếu không có role trong event, lấy từ localStorage
        const currentRole = getCurrentRole();
        console.log("App - Current role from localStorage:", currentRole);
        if (currentRole) {
          setRole(String(currentRole).toLowerCase());
        } else {
          // Nếu không có role, set về empty string để hiển thị GuestHeader
          console.log("App - No role found, setting to empty string for GuestHeader");
          setRole("");
        }
      }
      
      // Force re-render header by updating authKey
      console.log("App - Updating authKey to force re-render");
      setAuthKey(prev => prev + 1);
      
      // Fetch coins when user logs in
      if (user) {
        const userId = user.userId || user.UserId || user.id || user.Id;
        console.log("App - Auth changed, user:", user, "userId:", userId);
        if (userId) {
          fetchCoins(userId);
          fetchUser(); // Fetch user data when logged in
        }
      } else {
        // If user is null (logout), reset coins and user data
        console.log("App - User logged out, resetting coins and user data");
        useCoinsStore.getState().setCoins(0);
        useUserStore.getState().setUser(null);
      }
    };
    
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [fetchCoins, fetchUser]);
  if (hideLayout) {
    return (
      <>
        <AppRoutes />
        <Toast /> {/* ✅ luôn render toast */}
      </>
    );
  }

  // Kiểm tra layout đặc biệt
  const isReaderPage = location.pathname.startsWith("/reader");
  const isPlayerPage = location.pathname.startsWith("/player");

  // Nếu là trang Reader - chỉ render AppRoutes, ReaderManager sẽ được render bên trong ReaderPage
  if (isReaderPage) {
    return (
      <>
        <AppRoutes />
        <Toast />
      </>
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
        key={authKey}
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main layout */}
      <div className="flex flex-col flex-1 bg-gray-900 text-white lg:ml-64 overflow-x-hidden min-h-screen">
        {/* Header */}
        <HeaderManager
          key={authKey}
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
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            style: {
              background: "#059669",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#059669",
            },
          },
          error: {
            style: {
              background: "#dc2626",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#dc2626",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
