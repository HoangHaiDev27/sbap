'use client';
import { useState, useEffect } from 'react';
import {
  DashboardHeader,
  LoadingSpinner,
  StatsGrid,
  PendingBooksSection,
  RecentTransactionsSection,
  PendingWithdrawalsSection,
  RecentFeedbacksSection,
  TopRankingsSection,
} from '../../components/staff/dashboard';
import STAFF_DASHBOARD_API from '../../api/staffDashboardApi';
import { transactionApi } from '../../api/transactionApi';

export default function StaffPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([
    { title: 'Tổng số sách', value: '0', change: '', icon: 'ri-book-line', color: 'bg-blue-500' },
    { title: 'Chủ sách', value: '0', change: '', icon: 'ri-user-star-line', color: 'bg-green-500' },
    { title: 'Khách hàng', value: '0', change: '', icon: 'ri-user-line', color: 'bg-purple-500' },
    { title: 'Sách chờ duyệt', value: '0', change: '', icon: 'ri-file-check-line', color: 'bg-orange-500' },
    { title: 'Yêu cầu rút tiền', value: '0', change: 'Chờ xử lý', icon: 'ri-bank-line', color: 'bg-yellow-500' },
    { title: 'Giao dịch nạp xu', value: '0', change: 'Hôm nay', icon: 'ri-wallet-3-line', color: 'bg-indigo-500' },
    { title: 'Đánh giá mới', value: '0', change: '7 ngày qua', icon: 'ri-star-line', color: 'bg-pink-500' },
    { title: 'Gói đăng ký', value: '0', change: 'Đang active', icon: 'ri-vip-crown-line', color: 'bg-amber-500' },
  ]);

  const [pendingBooks, setPendingBooks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topOwners, setTopOwners] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats and rankings
      const dashboardResponse = await STAFF_DASHBOARD_API.getDashboard();
      const dashboard = dashboardResponse.data;

      // Update stats
      if (dashboard.stats) {
        const stats = dashboard.stats;
        setStatsData([
          { title: 'Tổng số sách', value: stats.totalBooks?.toString() || '0', change: '', icon: 'ri-book-line', color: 'bg-blue-500' },
          { title: 'Chủ sách', value: stats.bookOwners?.toString() || '0', change: '', icon: 'ri-user-star-line', color: 'bg-green-500' },
          { title: 'Khách hàng', value: stats.customers?.toString() || '0', change: '', icon: 'ri-user-line', color: 'bg-purple-500' },
          { title: 'Sách chờ duyệt', value: stats.pendingBooks?.toString() || '0', change: '', icon: 'ri-file-check-line', color: 'bg-orange-500' },
          { title: 'Yêu cầu rút tiền', value: stats.pendingWithdrawals?.toString() || '0', change: 'Chờ xử lý', icon: 'ri-bank-line', color: 'bg-yellow-500' },
          { title: 'Giao dịch nạp xu', value: stats.todayWalletTransactions?.toString() || '0', change: 'Hôm nay', icon: 'ri-wallet-3-line', color: 'bg-indigo-500' },
          { title: 'Đánh giá mới', value: stats.newReviewsLast7Days?.toString() || '0', change: '7 ngày qua', icon: 'ri-star-line', color: 'bg-pink-500' },
          { title: 'Gói đăng ký', value: stats.activeSubscriptions?.toString() || '0', change: 'Đang active', icon: 'ri-vip-crown-line', color: 'bg-amber-500' },
        ]);
      }

      // Update top books
      if (dashboard.topBooks) {
        const formattedBooks = dashboard.topBooks.map(book => ({
          id: book.bookId,
          title: book.title,
          author: book.author,
          salesCount: book.salesCount,
          revenue: book.revenue?.toLocaleString('vi-VN') || '0'
        }));
        setTopBooks(formattedBooks);
      }

      // Update top owners
      if (dashboard.topOwners) {
        const formattedOwners = dashboard.topOwners.map(owner => ({
          id: owner.ownerId,
          name: owner.name,
          email: owner.email,
          bookCount: owner.bookCount,
          revenue: owner.revenue?.toLocaleString('vi-VN') || '0'
        }));
        setTopOwners(formattedOwners);
      }

      // Load pending books
      try {
        const pendingBooksResponse = await STAFF_DASHBOARD_API.getPendingBooks(5);
        const pendingBooksList = pendingBooksResponse.data.map(book => ({
          id: book.bookId,
          title: book.title,
          author: book.author || 'N/A',
          owner: book.ownerName || 'N/A',
          date: new Date(book.createdAt).toLocaleDateString('vi-VN'),
          category: book.categoryName || 'Khác'
        }));
        setPendingBooks(pendingBooksList);
      } catch (err) {
        console.error('Error loading pending books:', err);
      }

      // Load recent transactions
      try {
        const transactionsResponse = await transactionApi.getTransactions({
          typeFilter: 'all',
          statusFilter: 'all',
          dateFilter: 'all',
          page: 1,
          pageSize: 4
        });
        
        // Handle both camelCase and PascalCase response formats
        const transactions = transactionsResponse?.transactions || transactionsResponse?.Transactions || [];
        
        if (transactions.length > 0) {
          // Chỉ lấy 4 giao dịch gần nhất
          const formattedTransactions = transactions
            .slice(0, 4)
            .map(transaction => ({
              id: transaction.id || transaction.Id || '',
              user: transaction.userName || transaction.UserName || 'N/A',
              type: formatTransactionType(transaction.type || transaction.Type || ''),
              time: formatTransactionTime(transaction.date || transaction.Date, transaction.time || transaction.Time),
              amount: formatTransactionAmount(transaction.amountCoin || transaction.AmountCoin, transaction.amountMoney || transaction.AmountMoney),
              status: formatTransactionStatus(transaction.status || transaction.Status || '')
            }));
          setRecentTransactions(formattedTransactions);
        }
      } catch (err) {
        console.error('Error loading recent transactions:', err);
      }

      // Load pending withdrawals
      try {
        const withdrawalsResponse = await transactionApi.getTransactions({
          typeFilter: 'withdrawal_request',
          statusFilter: 'Pending',
          dateFilter: 'all',
          page: 1,
          pageSize: 4
        });
        
        // Handle both camelCase and PascalCase response formats
        const withdrawals = withdrawalsResponse?.transactions || withdrawalsResponse?.Transactions || [];
        
        if (withdrawals.length > 0) {
          // Chỉ lấy 4 yêu cầu gần nhất
          const formattedWithdrawals = withdrawals
            .slice(0, 4)
            .map(withdrawal => {
              // Extract PaymentRequestId from transaction id (format: "PR{id}")
              const paymentRequestId = withdrawal.id?.startsWith('PR') 
                ? withdrawal.id.substring(2) 
                : withdrawal.Id?.startsWith('PR')
                ? withdrawal.Id.substring(2)
                : withdrawal.id || withdrawal.Id || '';
              
              return {
                id: paymentRequestId,
                owner: withdrawal.userName || withdrawal.UserName || 'N/A',
                amount: formatWithdrawalAmount(withdrawal.amountCoin || withdrawal.AmountCoin),
                date: formatWithdrawalDate(withdrawal.date || withdrawal.Date, withdrawal.time || withdrawal.Time)
              };
            });
          setPendingWithdrawals(formattedWithdrawals);
        }
      } catch (err) {
        console.error('Error loading pending withdrawals:', err);
      }

      // Load recent feedbacks
      try {
        const feedbacksResponse = await STAFF_DASHBOARD_API.getRecentFeedbacks(5);
        
        if (feedbacksResponse && feedbacksResponse.data) {
          const formattedFeedbacks = feedbacksResponse.data
            .slice(0, 5)
            .map(feedback => ({
              id: feedback.feedbackId || feedback.FeedbackId || '',
              user: feedback.userName || feedback.UserName || 'N/A',
              type: formatFeedbackType(feedback.targetType || feedback.TargetType || ''),
              date: formatFeedbackDate(feedback.createdAt || feedback.CreatedAt),
              content: feedback.content || feedback.Content || ''
            }));
          setRecentFeedbacks(formattedFeedbacks);
        }
      } catch (err) {
        console.error('Error loading recent feedbacks:', err);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for formatting transaction data
  const formatTransactionType = (type) => {
    const typeMap = {
      'wallet_topup': 'Nạp xu',
      'chapter_purchase': 'Mua chương',
      'withdrawal_request': 'Yêu cầu rút tiền',
      'subscription_purchase': 'Mua gói đăng ký'
    };
    return typeMap[type] || type;
  };

  const formatTransactionStatus = (status) => {
    const statusMap = {
      'Succeeded': 'Thành công',
      'Pending': 'Chờ xử lý',
      'Failed': 'Thất bại',
      'Cancelled': 'Đã hủy',
      'Approved': 'Đã duyệt',
      'Rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  };

  const formatTransactionAmount = (amountCoin, amountMoney) => {
    if (amountCoin && amountCoin > 0) {
      return `${amountCoin.toLocaleString('vi-VN')} xu`;
    }
    if (amountMoney && amountMoney > 0) {
      return `${amountMoney.toLocaleString('vi-VN')} VNĐ`;
    }
    return '0';
  };

  const formatTransactionTime = (date, time) => {
    try {
      // Combine date and time if both are provided
      if (date && time) {
        // Parse date in format yyyy-MM-dd and time in format HH:mm:ss
        const dateTimeStr = `${date} ${time}`;
        const dateTime = new Date(dateTimeStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
        
        // Check if date is valid
        if (isNaN(dateTime.getTime())) {
          return date || time || 'N/A';
        }
        
        const now = new Date();
        const diffMs = now - dateTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return dateTime.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      // If only date is provided
      if (date) {
        const dateOnly = new Date(date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
        if (!isNaN(dateOnly.getTime())) {
          return dateOnly.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
      return date || time || 'N/A';
    } catch (error) {
      return date || time || 'N/A';
    }
  };

  // Helper functions for formatting withdrawal data
  const formatWithdrawalAmount = (amountCoin) => {
    if (amountCoin && amountCoin > 0) {
      return `${amountCoin.toLocaleString('vi-VN')} xu`;
    }
    return '0 xu';
  };

  const formatWithdrawalDate = (date, time) => {
    try {
      if (date && time) {
        const dateTimeStr = `${date} ${time}`;
        const dateTime = new Date(dateTimeStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
        
        if (!isNaN(dateTime.getTime())) {
          return dateTime.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
      if (date) {
        const dateOnly = new Date(date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
        if (!isNaN(dateOnly.getTime())) {
          return dateOnly.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
      return date || time || 'N/A';
    } catch (error) {
      return date || time || 'N/A';
    }
  };

  // Helper functions for formatting feedback data
  const formatFeedbackType = (targetType) => {
    const typeMap = {
      'Book': 'Báo cáo sách',
      'Chapter': 'Báo cáo chương',
      'User': 'Báo cáo người dùng',
      'System': 'Phản hồi hệ thống'
    };
    return typeMap[targetType] || targetType || 'Khác';
  };

  const formatFeedbackDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          <DashboardHeader
            title="Tổng quan hệ thống"
            description="Quản lý và theo dõi hoạt động của nền tảng"
          />

          <StatsGrid statsData={statsData} />

          {/* Main Content Grid - 3 cột */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <PendingBooksSection pendingBooks={pendingBooks} />

            <RecentTransactionsSection transactions={recentTransactions} />

            <PendingWithdrawalsSection
              withdrawals={pendingWithdrawals}
            />
          </div>

          <TopRankingsSection topBooks={topBooks} topOwners={topOwners} />

          <RecentFeedbacksSection feedbacks={recentFeedbacks} />
        </div>
      </main>
    </div>
  );
}
