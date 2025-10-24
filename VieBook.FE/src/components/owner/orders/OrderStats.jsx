import { RiCheckLine, RiCloseLine, RiTimeLine, RiMoneyDollarCircleLine } from "react-icons/ri";

export default function OrderStats({ orders }) {
  const totalOrders = orders.length;
  const completed = orders.filter(o => o.status === "Hoàn thành").length;
  const pending = orders.filter(o => o.status === "Đang chờ").length;
  const revenue = orders
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
          <p className="text-xl font-bold">{pending}</p>
          <p className="text-sm text-gray-400">Đang chờ</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiCloseLine size={28} className="text-red-400" />
        <div>
          <p className="text-xl font-bold">{revenue.toLocaleString()} xu</p>
          <p className="text-sm text-gray-400">Doanh thu</p>
        </div>
      </div>
    </div>
  );
}
