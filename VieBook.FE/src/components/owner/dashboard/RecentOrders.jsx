import { Link } from "react-router-dom";

export default function RecentOrders() {
  const recentOrders = [
    {
      id: 1,
      title: "Triết học cuộc sống",
      price: "299.000 VND",
      date: "15/12/2024",
      status: "Đã giao",
      cover: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      title: "Kỹ năng giao tiếp hiệu quả",
      price: "199.000 VND",
      date: "14/12/2024",
      status: "Đang chờ",
      cover: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      title: "Tâm lý học tích cực",
      price: "249.000 VND",
      date: "13/12/2024",
      status: "Thành công",
      cover: "https://via.placeholder.com/40",
    },
    {
      id: 4,
      title: "Quản lý thời gian hiệu quả",
      price: "179.000 VND",
      date: "12/12/2024",
      status: "Đã hủy",
      cover: "https://via.placeholder.com/40",
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Đơn hàng gần nhất</h2>
        <Link to="/owner/orders" className="text-sm text-orange-400 hover:underline">
          Xem tất cả
        </Link>
      </div>
      <ul className="space-y-3">
        {recentOrders.map((order) => (
          <li
            key={order.id}
            className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
          >
            <div className="flex items-center space-x-3">
              <img
                src={order.cover}
                alt={order.title}
                className="w-10 h-10 rounded"
              />
              <div>
                <p className="font-medium">{order.title}</p>
                <p className="text-xs text-gray-400">{order.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{order.price}</p>
              <p className="text-xs text-green-400">{order.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
