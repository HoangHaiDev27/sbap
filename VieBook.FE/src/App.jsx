import React, { useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  //const [role, setRole] = useState("user");
  const [role, setRole] = useState("admin");
  //const [role, setRole] = useState("staff");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
