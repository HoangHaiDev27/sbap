import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import AuthenticationPage from "../pages/AuthenticationPage";
import VipPackagesPage from "../pages/VipPackagesPage";
import RankingPage from "../pages/RankingPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Routes cho client */}
      <Route path="/" element={<h1>Trang chủ</h1>} />
      <Route path="/auth" element={<AuthenticationPage/>} />
      <Route path="/vip" element={<VipPackagesPage/>} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/listening" element={<h1>Đang nghe</h1>} />
      <Route path="/forum" element={<h1>Diễn đàn</h1>} />
      <Route path="/wishlist" element={<WishListPage />} />
      {/* Routes cho staff/admin */}
      <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      <Route path="/staff" element={<h1>Staff Panel</h1>} />
      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  );
}

export default AppRoutes;
