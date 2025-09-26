import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Form, Route, Routes } from "react-router-dom";
import CustomerPage from "../pages/CustomerPage";
import UserWishlist from "../components/user/UserWishlist";
import WishListPage from "../pages/WishListPage";
import AdminPage from "../pages/admin/AdminPage";
import StaffManagerPage from "../pages/admin/StaffManagement";
import AdminProfile from "../pages/admin/AdminProfile";
import StaffPage from "../pages/staff/StaffPage";
import StaffBooksPage from "../pages/staff/StaffBooksPage";
import WithdrawApprovalPage from "../pages/staff/WithdrawApprovalPage";
import PendingBooksManagement from "../pages/staff/PendingBooksManagement";
import CustomersManagement from "../pages/staff/CustomersManagement";
import CategoriesManagement from "../pages/staff/CategoriesManagement";
import BookOwnersManagement from "../pages/staff/BookOwnersManagement";
import TransactionsManagement from "../pages/staff/TransactionsManagement";
import FeedbackManagement from "../pages/staff/FeedbackManagement";

import Dashboard from "../pages/owner/Dashboard";
import OwnerBooks from "../pages/owner/OwnerBooks";
import BookForm from "../pages/owner/BookForm";
import OwnerChapters from "../pages/owner/OwnerChapters";
import ChapterForm from "../pages/owner/ChapterForm";
import ChapterEdit from "../pages/owner/ChapterEdit";
import OwnerOrders from "../pages/owner/OwnerOrders";
import OrderDetail from "../pages/owner/OrderDetail";
import PromotionPage from "../pages/owner/PromotionPage";
import OwnerReviews from "../pages/owner/OwnerReviews";
import SupportChat from "../pages/owner/SupportChat";
import BookDetailOwnerPage from "../pages/owner/BookDetailPage";
import BookEditForm from "../pages/owner/BookEditForm";
import BookAudioRequest from "../pages/owner/BookAudioRequest";
import ProfilePage from "../pages/owner/ProfilePage";
import WithdrawPage from "../pages/owner/WithdrawPage";

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
import ListeningPage from "../pages/ListeningPage";
import ChangePassword from "../components/auth/ChangePassword"; // kiểm tra đúng đường dẫn
import AuthenticationManager from "../layouts/AuthenticationManager";
import RechargePage from "../pages/RechargePage";
import VerifyEmail from "../pages/VerifyEmail";
import AccessDenied from "../pages/AccessDenied";
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Routes cho client */}
      <Route path="/vip" element={<VipPackagesPage />} />
      <Route path="/" element={<Home />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/listening" element={<ListeningPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/wishlist" element={<WishListPage />} />
      <Route path="/audiobooks" element={<AudiobookPage />} />
      <Route path="/stories" element={<StoryPage />} />
      <Route path="/bookdetails/:id" element={<BookDetailPage />} />
      {/* Reader dùng ReaderManager làm layout */}
      <Route path="/reader/:id" element={<ReaderPage />} />
      <Route path="/player/:id" element={<PlayerPage />} />
      {/* Routes cho staff/admin */}
      {/* Demo: Chỉ cấu hình 1 route admin để demo */}
      
      {/* Các route khác giữ nguyên không bảo vệ để demo */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/staff" element={<StaffManagerPage />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
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

      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/recharge" element={<RechargePage />} />

      <Route path="/owner/dashboard" element={<Dashboard />} />
      <Route path="/owner/books" element={<OwnerBooks />} />
      <Route path="/owner/books/new" element={<BookForm />} />
      <Route path="/owner/books/:bookId/chapters" element={<OwnerChapters />} />
      <Route
        path="/owner/books/:bookId/chapters/new"
        element={<ChapterForm />}
      />
      <Route path="/owner/books/:bookId/chapters/edit/:chapterId" element={<ChapterEdit />} />
      <Route path="/owner/sales-history" element={<OwnerOrders />} />
      <Route path="/owner/orders/:orderId" element={<OrderDetail />} />
      <Route path="/owner/promotions" element={<PromotionPage />} />
      <Route path="/owner/feedback" element={<OwnerReviews />} />
      <Route path="/owner/chat" element={<SupportChat />} />
      <Route path="/owner/books/:id" element={<BookDetailOwnerPage />} />
      <Route path="/owner/books/:bookId/edit" element={<BookEditForm />} />
      <Route path="/owner/books/:id/audio" element={<BookAudioRequest />} />
      <Route path="/owner/profile/overview" element={<ProfilePage />} />
      <Route path="/owner/withdraw" element={<WithdrawPage />} />

      <Route path="/change-password" element={<ChangePassword />} />
      {/* Routes cho authentication */}
      <Route path="/auth" element={<AuthenticationPage />} />
      <Route path="/auth/change-password" element={<AuthenticationManager defaultTab="change" />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      
      {/* Access Denied page */}
      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}

export default AppRoutes;
