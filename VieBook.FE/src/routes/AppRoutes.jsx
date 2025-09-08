import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import AdminPage from "../pages/admin/AdminPage";
import StaffManagerPage from "../pages/admin/StaffManagerPage";
import AdminProfile from '../pages/admin/AdminProfile';
import StaffPage from '../pages/staff/StaffPage';
import StaffBooksPage from '../pages/staff/StaffBooksPage';
import WithdrawApprovalPage from '../pages/staff/WithdrawApprovalPage';
import PendingBooksManagement from '../pages/staff/PendingBooksManagement';
import CustomersManagement from '../pages/staff/CustomersManagement';
import CategoriesManagement from '../pages/staff/CategoriesManagement';
import BookOwnersManagement from '../pages/staff/BookOwnersManagement';
import TransactionsManagement from '../pages/staff/TransactionsManagement';
import FeedbackManagement from '../pages/staff/FeedbackManagement';


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
      {/* Admin routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/staff" element={<StaffManagerPage />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      {/* Admin routes */}
      {/* <Route path="/admin" element={<h1>Admin Dashboard</h1>} /> */}
      {/* Staff routes */}
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/staff/books" element={<StaffBooksPage />} />
      <Route path="/staff/withdrawals" element={<WithdrawApprovalPage />} />
      <Route path="/staff/pending-books" element={<PendingBooksManagement />} />
      <Route path="/staff/categories" element={<CategoriesManagement />} />
      <Route path="/staff/customers" element={<CustomersManagement />} />
      <Route path="/staff/book-owners" element={<BookOwnersManagement />} />
      <Route path="/staff/transactions" element={<TransactionsManagement />} />
      <Route path="/staff/feedback" element={<FeedbackManagement />} />
      {/* Staff routes */}
      {/* <Route path="/staff" element={<h1>Staff Panel</h1>} /> */}

      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  );
}

export default AppRoutes;
