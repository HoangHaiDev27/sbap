import React, { useState } from "react";
import UsersPage from "./pages/UsersPage";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [role, setRole] = useState("client");

  return (
    <div className="flex h-screen">
      {/* Sidebar - fixed position */}
      <SidebarManager role={role} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64 bg-gray-900 text-white">
        {/* Header */}
        <HeaderManager role={role} />

        {/* Main content */}
        <main className="flex-1">
          <AppRoutes />
        </main>
        {/* <AppRoutes /> */}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
