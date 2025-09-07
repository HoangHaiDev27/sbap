import React, { useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
function App() {
  const [role, setRole] = useState("user");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const noLayoutRoutes = ["/auth"]; 

  const hideLayout = noLayoutRoutes.includes(location.pathname);

  if (hideLayout) {
    //  Chỉ render nội dung route, không layout
    return <AppRoutes />;
  }
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

        {/* Main content (chiếm hết phần trống còn lại) */}
        <main className="flex-1">
          <AppRoutes />
        </main>

        {/* Footer (luôn nằm cuối trang, không đè nội dung) */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
