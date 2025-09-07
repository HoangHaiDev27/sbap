import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import Dashboard from "../pages/owner/Dashboard";
import OwnerBooks from "../pages/owner/OwnerBooks";
import BookForm from "../pages/owner/BookForm";
import OwnerChapters from "../pages/owner/OwnerChapters";
import ChapterForm from "../pages/owner/ChapterForm";
import OwnerOrders from "../pages/owner/OwnerOrders";
import OrderDetail from "../pages/owner/OrderDetail";
import PromotionPage from "../pages/owner/PromotionPage";

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
      <Route path="/wishlist" element={<WishListPage />} />
      {/* Routes cho staff/admin */}
      <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      <Route path="/staff" element={<h1>Staff Panel</h1>} />
      <Route path="/customer" element={<CustomerPage />} />

      {/* Routes cho book owner */}
      <Route path="/owner/dashboard" element={<Dashboard />} />
      <Route path="/owner/books" element={<OwnerBooks />} />
      <Route path="/owner/books/new" element={<BookForm />} />
      <Route path="/owner/books/:bookId/chapters" element={<OwnerChapters />} />
      <Route path="/owner/books/:bookId/chapters/new" element={<ChapterForm />} />
      <Route path="/owner/sales-history" element={<OwnerOrders />} />
      <Route path="/owner/orders/:orderId" element={<OrderDetail />} />
      <Route path="/owner/promotions" element={<PromotionPage />} />
      
    </Routes>
  );
}

export default AppRoutes;
