import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import Home from "../pages/HomePage";
import AudiobookPage from "../pages/AudiobookPage";
import StoryPage from "../pages/StoryPage";
import BookDetailPage from "../pages/BookDetailPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Routes cho client */}
      <Route path="/" element={<Home />} />
      <Route path="/vip" element={<h1>Mua gói VIP</h1>} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/ranking" element={<h1>Bảng xếp hạng</h1>} />
      <Route path="/listening" element={<h1>Đang nghe</h1>} />
      <Route path="/forum" element={<h1>Diễn đàn</h1>} />
      <Route path="/wishlist" element={<WishListPage />} />
      <Route path="/audiobooks" element={<AudiobookPage />} />
      <Route path="/stories" element={<StoryPage />} />
      <Route path="/stories" element={<StoryPage />} />
      <Route path="/bookdetails/:id" element={<BookDetailPage />} />
      {/* Routes cho staff/admin */}
      <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      <Route path="/staff" element={<h1>Staff Panel</h1>} />
      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  );
}

export default AppRoutes;
