import { RiCheckLine, RiTimeLine, RiMoneyDollarCircleLine, RiCoinsLine } from "react-icons/ri";

export default function OrderStats({ orders, stats }) {
  // Sử dụng stats từ API nếu có, nếu không thì tính từ orders
  const totalOrders = stats?.totalOrders || orders.length;
  const completed = stats?.completedOrders || orders.filter(o => o.status === "Hoàn thành").length;
  const refunded = stats?.refundedOrders || orders.filter(o => o.status === "Đã hoàn tiền").length;
  const revenue = stats?.totalRevenue || orders
    .filter(o => o.status === "Hoàn thành")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiMoneyDollarCircleLine size={28} className="text-blue-400" />
        <div>
          <p className="text-xl font-bold">{totalOrders}</p>
          <p className="text-sm text-gray-400">Tổng đơn</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiCheckLine size={28} className="text-green-400" />
        <div>
          <p className="text-xl font-bold">{completed}</p>
          <p className="text-sm text-gray-400">Hoàn thành</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiTimeLine size={28} className="text-yellow-400" />
        <div>
          <p className="text-xl font-bold">{refunded}</p>
          <p className="text-sm text-gray-400">Đã hoàn tiền</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiCoinsLine size={28} className="text-yellow-500" />
        <div>
          <p className="text-xl font-bold">{revenue.toLocaleString()} xu</p>
          <p className="text-sm text-gray-400">Doanh thu</p>
        </div>
      </div>
    </div>
  );
}
