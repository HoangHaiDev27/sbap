import { Link } from "react-router-dom";

export default function RecentOrders({ orders = [] }) {
  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('vi-VN').format(amount)} xu`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Completed': 'Hoàn thành',
      'Pending': 'Đang chờ',
      'Cancelled': 'Đã hủy',
      'Processing': 'Đang xử lý'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Completed': 'text-green-400',
      'Pending': 'text-yellow-400',
      'Cancelled': 'text-red-400',
      'Processing': 'text-blue-400'
    };
    return colorMap[status] || 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Đơn hàng gần nhất</h2>
        <Link to="/owner/sales-history" className="text-sm text-orange-400 hover:underline">
          Xem tất cả
        </Link>
      </div>
      <ul className="space-y-3">
        {orders.length === 0 ? (
          <li className="text-center text-gray-400 py-4">
            Chưa có đơn hàng nào
          </li>
        ) : (
          orders.map((order) => (
            <li
              key={order.orderId}
              className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={order.bookCover || "https://via.placeholder.com/40"}
                  alt={order.bookTitle}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{order.bookTitle}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(order.price)}</p>
                <p className={`text-xs ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
