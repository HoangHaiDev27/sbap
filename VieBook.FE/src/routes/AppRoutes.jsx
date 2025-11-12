import React from "react";
import LibraryPage from "../pages/LibraryPage";
import { Route, Routes } from "react-router-dom";
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
import StaffSupportChat from "../pages/staff/StaffSupportChat";

import Dashboard from "../pages/owner/Dashboard";
import OwnerBooks from "../pages/owner/OwnerBooks";
import BookForm from "../pages/owner/BookForm";
import OwnerChapters from "../pages/owner/OwnerChapters";
import ChapterForm from "../pages/owner/ChapterForm";
import ChapterEdit from "../pages/owner/ChapterEdit";
import ChapterView from "../pages/owner/ChapterView";
import OwnerOrders from "../pages/owner/OwnerOrders";
import OrderDetail from "../pages/owner/OrderDetail";
import PromotionPage from "../pages/owner/PromotionPage";
import PromotionDetailPage from "../pages/owner/PromotionDetailPage";
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
import PlayerPage from "../pages/PlayerPage";
import ListeningPage from "../pages/ListeningPage";
import AudioListenPage from "../pages/AudioListenPage";
import ChangePassword from "../components/auth/ChangePassword"; // kiểm tra đúng đường dẫn
import AuthenticationManager from "../layouts/AuthenticationManager";
import RechargePage from "../pages/RechargePage";
import VerifyEmail from "../pages/VerifyEmail";
import AccessDenied from "../pages/AccessDenied";
import ProtectedRoute from "../components/common/ProtectedRoute";
import TermsPage from "../components/footer/TermsPage";
import PrivacyPage from "../components/footer/PrivacyPage";
import SecurityPage from "../components/footer/SecurityPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - không yêu cầu đăng nhập */}
      <Route path="/" element={<Home />} />
      <Route path="/bookdetails/:id" element={<BookDetailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/auth" element={<AuthenticationPage />} />
      <Route
        path="/auth/change-password"
        element={<AuthenticationManager defaultTab="change" />}
      />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Routes cho client - yêu cầu đăng nhập (customer hoặc owner) */}
      <Route
        path="/vip"
        element={<VipPackagesPage />}
      />
      <Route
        path="/library"
        element={<LibraryPage />}
      />
      <Route
        path="/ranking"
        element={<RankingPage />}
      />
      <Route
        path="/listening"
        element={<ListeningPage />}
      />
      <Route
        path="/forum"
        element={<ForumPage />}
      />
      <Route
        path="/wishlist"
        element={<WishListPage />}
      />
      <Route
        path="/stories"
        element={<AudiobookPage />}
      />
      <Route
        path="/audiobooks"
        element={<StoryPage />}
      />
      <Route
        path="/reader/:id"
        element={<ReaderPage />}
      />
      <Route
        path="/reader/:id/chapter/:chapterId"
        element={<ReaderPage />}
      />
      <Route
        path="/listen/:bookId"
        element={<AudioListenPage />}
      />
      <Route
        path="/listen/:bookId/chapter/:chapterId"
        element={<AudioListenPage />}
      />
      <Route
        path="/player/:id"
        element={<PlayerPage />}
      />
      <Route
        path="/customer"
        element={<CustomerPage />}
      />
      <Route
        path="/recharge"
        element={<RechargePage />}
      />
      {/* Routes cho Owner - chỉ owner mới truy cập được */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OwnerBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/new"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <BookForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:bookId/chapters"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OwnerChapters />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:bookId/chapters/new"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <ChapterForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:bookId/chapters/edit/:chapterId"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <ChapterEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:bookId/chapters/view/:chapterId"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <ChapterView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/sales-history"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OwnerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/orders/:orderId"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/promotions"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <PromotionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/promotions/:promotionId"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <PromotionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/feedback"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OwnerReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/chat"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <SupportChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:id"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <BookDetailOwnerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:bookId/edit"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <BookEditForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/books/:id/audio"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <BookAudioRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/profile/overview"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/withdraw"
        element={
          <ProtectedRoute allowedRoles={["Owner"]}>
            <WithdrawPage />
          </ProtectedRoute>
        }
      />

      {/* Routes cho Staff - staff và admin đều truy cập được */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/books"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffBooksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/withdrawals"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <WithdrawApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/pending-books"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <PendingBooksManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/categories"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <CategoriesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/customers"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <CustomersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/book-owners"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <BookOwnersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/transactions"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <TransactionsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/feedback"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <FeedbackManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/support-chat"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffSupportChat />
          </ProtectedRoute>
        }
      />

      {/* Routes cho Admin - chỉ admin mới truy cập được */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <StaffManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
