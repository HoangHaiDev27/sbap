import React, { useState } from "react";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [role, setRole] = useState("user");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SidebarManager role={role} />

      {/* Main layout */}
      <div className="flex flex-col flex-1 ml-64 bg-gray-900 text-white">
        {/* Header */}
        <HeaderManager role={role} />

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
