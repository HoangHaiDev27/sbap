import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Form, Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import AuthenticationPage from "../pages/AuthenticationPage";
import VipPackagesPage from "../pages/VipPackagesPage";
import RankingPage from "../pages/RankingPage";
import { FaForumbee } from "react-icons/fa";
import ForumPage from "../pages/ForumPage";
import Home from "../pages/HomePage";
import AudiobookPage from "../pages/AudiobookPage";
import StoryPage from "../pages/StoryPage";
import BookDetailPage from "../pages/BookDetailPage";
import ReaderPage from "../pages/ReaderPage";
import ReaderManager from "../layouts/ReaderManager";
import PlayerPage from "../pages/PlayerPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Routes cho client */}
      <Route path="/auth" element={<AuthenticationPage/>} />
      <Route path="/vip" element={<VipPackagesPage/>} />
      <Route path="/" element={<Home />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/listening" element={<h1>Đang nghe</h1>} />
      <Route path="/forum" element={<ForumPage/>} />
      <Route path="/wishlist" element={<WishListPage />} />
      <Route path="/audiobooks" element={<AudiobookPage />} />
      <Route path="/stories" element={<StoryPage />} />
      <Route path="/bookdetails/:id" element={<BookDetailPage />} />
      {/* Reader dùng ReaderManager làm layout */}
      <Route path="/reader/:id" element={<ReaderPage />} />
      <Route path="/player/:id" element={<PlayerPage />} />
      {/* Routes cho staff/admin */}
      <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      <Route path="/staff" element={<h1>Staff Panel</h1>} />
      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  );
}

export default AppRoutes;
