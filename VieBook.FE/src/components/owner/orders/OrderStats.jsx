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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3">
        <RiMoneyDollarCircleLine className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-xl font-bold truncate">{totalOrders}</p>
          <p className="text-xs sm:text-sm text-gray-400">Tổng đơn</p>
        </div>
      </div>
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3">
        <RiBookLine className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-xl font-bold truncate">{softChapters}</p>
          <p className="text-xs sm:text-sm text-gray-400">Chương Soft</p>
        </div>
      </div>
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3">
        <RiHeadphoneLine className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-xl font-bold truncate">{audioChapters}</p>
          <p className="text-xs sm:text-sm text-gray-400">Chương Audio</p>
        </div>
      </div>
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3 col-span-2 lg:col-span-1">
        <RiCoinsLine className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-xl font-bold truncate">{revenue.toLocaleString()} xu</p>
          <p className="text-xs sm:text-sm text-gray-400">Doanh thu</p>
        </div>
      </div>
    </div>
  );
}
