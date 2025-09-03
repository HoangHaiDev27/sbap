import React, { useState } from "react";
import UsersPage from "./pages/UsersPage";
import SidebarManager from "./layouts/SidebarManager";
import HeaderManager from "./layouts/HeaderManager";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";

function App() {
  const [role, setRole] = useState("client");

  return (
    <div className="flex h-screen">
      {/* Sidebar - fixed position */}
      <SidebarManager role={role} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <HeaderManager role={role} />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            {/* Routes cho client */}
            <Route path="/" element={<UsersPage/>} />
            <Route path="/vip" element={<h1>Mua gói VIP</h1>} />
            <Route path="/library" element={<h1>Thư viện</h1>} />
            <Route path="/ranking" element={<h1>Bảng xếp hạng</h1>} />
            <Route path="/listening" element={<h1>Đang nghe</h1>} />
            <Route path="/forum" element={<h1>Diễn đàn</h1>} />

            {/* Routes cho staff/admin */}
            <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
            <Route path="/staff" element={<h1>Staff Panel</h1>} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
