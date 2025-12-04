import { RiBookLine, RiHeadphoneLine, RiMoneyDollarCircleLine, RiCoinsLine } from "react-icons/ri";

export default function OrderStats({ orders, stats }) {
  // Sử dụng stats từ API nếu có, nếu không thì tính từ orders
  const totalOrders = stats?.totalOrders || orders.length;
  
  // Đếm số chapter soft
  const softChapters = stats?.softChapters || orders.filter(o => 
    o.orderType === "BuyChapterSoft"
  ).length;
  
  // Đếm số chapter audio
  const audioChapters = stats?.audioChapters || orders.filter(o => 
    o.orderType === "BuyChapterAudio"
  ).length;
  
  const revenue = stats?.totalRevenue || orders
    .filter(o => o.orderType !== "Refund")
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
        <RiBookLine size={28} className="text-purple-400" />
        <div>
          <p className="text-xl font-bold">{softChapters}</p>
          <p className="text-sm text-gray-400">Chương Soft</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
        <RiHeadphoneLine size={28} className="text-indigo-400" />
        <div>
          <p className="text-xl font-bold">{audioChapters}</p>
          <p className="text-sm text-gray-400">Chương Audio</p>
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
