import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Routes cho client */}
      <Route path="/" element={<h1>Trang chủ</h1>} />
      <Route path="/vip" element={<h1>Mua gói VIP</h1>} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/ranking" element={<h1>Bảng xếp hạng</h1>} />
      <Route path="/listening" element={<h1>Đang nghe</h1>} />
      <Route path="/forum" element={<h1>Diễn đàn</h1>} />
      {/* Routes cho staff/admin */}
      <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      <Route path="/staff" element={<h1>Staff Panel</h1>} />
      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  );
}

export default AppRoutes;
