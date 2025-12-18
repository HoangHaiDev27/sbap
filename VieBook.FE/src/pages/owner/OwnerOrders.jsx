import { useEffect, useState, useMemo, useCallback } from "react";
import OrderStats from "../../components/owner/orders/OrderStats";
import OrderTable from "../../components/owner/orders/OrderTable";
import OrderStatsSkeleton from "../../components/owner/orders/OrderStatsSkeleton";
import OrderTableSkeleton from "../../components/owner/orders/OrderTableSkeleton";
import orderItemApi from "../../api/orderItemApi";

// Helper function to format order type
const getOrderTypeLabel = (orderType) => {
  const typeMap = {
    'BuyChapter': 'Mua chương',
    'BuyChapterSoft': 'Bản mềm',
    'BuyChapterAudio': 'Bản audio',
    'BuyChapterBoth': 'Cả hai',
    'Refund': 'Hoàn tiền'
  };
  return typeMap[orderType] || orderType;
};

// Helper function to get order type badge color
const getOrderTypeBadgeColor = (orderType) => {
  const colorMap = {
    'BuyChapter': 'bg-blue-600',
    'BuyChapterSoft': 'bg-purple-600',
    'BuyChapterAudio': 'bg-indigo-600',
    'BuyChapterBoth': 'bg-green-600',
    'Refund': 'bg-red-600'
  };
  return colorMap[orderType] || 'bg-gray-600';
};

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch function
  const fetchOwnerOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách orders và stats song song (không cần truyền ownerId)
      const [ordersResponse, statsResponse] = await Promise.all([
        orderItemApi.getMyOrders(),
        orderItemApi.getMyOrderStats()
      ]);

      if (ordersResponse.success) {
        // Transform data để phù hợp với component hiện tại
        const transformedOrders = ordersResponse.data.map(order => ({
          id: `ORD-${order.orderItemId}`,
          orderItemId: order.orderItemId,
          customer: order.customerName,
          customerEmail: order.customerEmail,
          customerId: order.customerId,
          status: order.status,
          total: order.cashSpent,
          date: new Date(order.paidAt).toLocaleString('vi-VN'),
          paidAt: order.paidAt,
          image: order.bookCoverUrl || "https://via.placeholder.com/60x80.png?text=Book",
          bookTitle: order.bookTitle,
          bookId: order.bookId,
          chapterTitle: order.chapterTitle,
          chapterId: order.chapterId,
          orderType: order.orderType,
          orderTypeLabel: getOrderTypeLabel(order.orderType),
          orderTypeBadgeColor: getOrderTypeBadgeColor(order.orderType),
          unitPrice: order.unitPrice
        }));
        
        setOrders(transformedOrders);
      } else {
        setError(ordersResponse.message || "Không thể tải danh sách đơn hàng");
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

    } catch (err) {
      console.error('Error fetching owner orders:', err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerOrders();
  }, [fetchOwnerOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchOwnerOrders();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchOwnerOrders, loading]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-4 sm:py-6 text-white min-h-screen">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Lịch sử bán hàng</h1>
        <OrderStatsSkeleton />
        <OrderTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-4 sm:py-6 text-white min-h-screen">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Lịch sử bán hàng</h1>
        <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
          <div className="text-base sm:text-lg text-red-400 text-center px-4">Lỗi: {error}</div>
        </div>
      </div>
    );
  }

  // Empty state khi không có orders
  if (orders.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-4 sm:py-6 text-white min-h-screen">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Lịch sử bán hàng</h1>
        <div className="bg-slate-800 p-6 sm:p-8 rounded-lg text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-300">Chưa có đơn hàng nào</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-2">
            Khi có khách hàng mua sách của bạn, các đơn hàng sẽ xuất hiện ở đây
          </p>
          <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 px-2">
            💡 Hãy tạo thêm sách và chương để thu hút khách hàng
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/owner/books/create'}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors text-sm sm:text-base font-medium min-h-[44px]"
            >
              📚 Tạo sách mới
            </button>
            <button 
              onClick={() => window.location.href = '/owner/books'}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 rounded-lg transition-colors text-sm sm:text-base font-medium min-h-[44px]"
            >
              📖 Quản lý sách
            </button>
            <button 
              onClick={() => window.open('https://help.viebook.com', '_blank')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg transition-colors text-sm sm:text-base font-medium min-h-[44px]"
            >
              💡 Xem hướng dẫn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 text-white min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Lịch sử bán hàng</h1>
      <OrderStats orders={orders} stats={stats} />
      <OrderTable orders={orders} />
    </div>
  );
}
