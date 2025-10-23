import { useEffect, useState, useMemo, useCallback } from "react";
import OrderStats from "../../components/owner/orders/OrderStats";
import OrderTable from "../../components/owner/orders/OrderTable";
import OrderStatsSkeleton from "../../components/owner/orders/OrderStatsSkeleton";
import OrderTableSkeleton from "../../components/owner/orders/OrderTableSkeleton";
import orderItemApi from "../../api/orderItemApi";

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
          customer: order.customerName,
          customerEmail: order.customerEmail,
          status: order.status,
          total: order.cashSpent,
          date: new Date(order.paidAt).toLocaleString('vi-VN'),
          image: order.bookCoverUrl || "https://via.placeholder.com/60x80.png?text=Book",
          bookTitle: order.bookTitle,
          chapterTitle: order.chapterTitle,
          orderType: order.orderType,
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
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">Lịch sử bán hàng</h1>
        <OrderStatsSkeleton />
        <OrderTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">Lịch sử bán hàng</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-400">Lỗi: {error}</div>
        </div>
      </div>
    );
  }

  // Empty state khi không có orders
  if (orders.length === 0) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">Lịch sử bán hàng</h1>
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-300">Chưa có đơn hàng nào</h3>
          <p className="text-gray-400 mb-6">
            Khi có khách hàng mua sách của bạn, các đơn hàng sẽ xuất hiện ở đây
          </p>
          <div className="text-sm text-gray-500 mb-6">
            💡 Hãy tạo thêm sách và chương để thu hút khách hàng
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/owner/books/create'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              📚 Tạo sách mới
            </button>
            <button 
              onClick={() => window.location.href = '/owner/books'}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              📖 Quản lý sách
            </button>
            <button 
              onClick={() => window.open('https://help.viebook.com', '_blank')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              💡 Xem hướng dẫn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lịch sử bán hàng</h1>
        <button
          onClick={fetchOwnerOrders}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>
      <OrderStats orders={orders} stats={stats} />
      <OrderTable orders={orders} />
    </div>
  );
}
