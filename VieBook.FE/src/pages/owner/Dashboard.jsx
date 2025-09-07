import {
  RiMoneyDollarCircleLine,
  RiBook2Line,
  RiEyeLine,
  RiStarLine,
} from "react-icons/ri";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import RecentOrders from "../../components/owner/dashboard/RecentOrders";
import BestSellers from "../../components/owner/dashboard/BestSellers";

export default function OwnerDashboard() {
  // dữ liệu demo
  const stats = [
    {
      label: "Doanh thu",
      value: "120M",
      icon: <RiMoneyDollarCircleLine size={28} />,
      color: "bg-green-500",
    },
    {
      label: "Sách đã bán",
      value: 324,
      icon: <RiBook2Line size={28} />,
      color: "bg-blue-500",
    },
    {
      label: "Lượt xem",
      value: "12.5K",
      icon: <RiEyeLine size={28} />,
      color: "bg-purple-500",
    },
    {
      label: "Lượt đánh giá",
      value: 210,
      icon: <RiStarLine size={28} />,
      color: "bg-orange-500",
    },
  ];

  const pieData = [
    { name: "Tiểu thuyết", value: 400 },
    { name: "Kinh doanh", value: 300 },
    { name: "Tâm lý", value: 200 },
    { name: "Khác", value: 100 },
  ];
  const pieColors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];

  const barData = [
    { month: "T1", sales: 30 },
    { month: "T2", sales: 45 },
    { month: "T3", sales: 60 },
    { month: "T4", sales: 40 },
    { month: "T5", sales: 70 },
    { month: "T6", sales: 90 },
  ];

  return (
    <div className="p-6 text-white">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} rounded-xl p-4 flex items-center space-x-3 shadow-lg`}
          >
            <div className="text-white">{stat.icon}</div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo thể loại</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Sách bán theo tháng</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="sales" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentOrders />
        <BestSellers />
      </div>
    </div>
  );
}
