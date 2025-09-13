import { RiShoppingCartLine, RiMoneyDollarCircleLine, RiStarLine, RiEyeLine } from "react-icons/ri";

export default function BookStatsCard() {
  const stats = [
    { icon: RiShoppingCartLine, label: "Lượt mua", value: "156" },
    { icon: RiMoneyDollarCircleLine, label: "Doanh thu", value: "18.7M VND" },
    { icon: RiStarLine, label: "Đánh giá TB", value: "4.8/5" },
    { icon: RiEyeLine, label: "Lượt đọc", value: "2.3K" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
          <stat.icon className="text-2xl text-gray-300" />
        </div>
      ))}
    </div>
  );
}
