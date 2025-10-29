import React, { useEffect, useState } from "react";
import { getPromotionStats } from "../../../api/promotionApi";
import { getUserId } from "../../../api/authApi";

export default function PromotionStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ownerId = getUserId();
    if (!ownerId) return;
    getPromotionStats(ownerId)
      .then(setStats)
      .catch((e) => setError(e.message || "Lỗi lấy thống kê"));
  }, []);

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-slate-800 text-white p-4 rounded-2xl shadow animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Đang hoạt động", value: String(stats.activeCount), sub: `${stats.totalPromotions} khuyến mãi` },
    { title: "Sắp diễn ra", value: String(stats.upcomingCount), sub: `${stats.totalBooksApplied} sách áp dụng` },
    { title: "Đã kết thúc", value: String(stats.expiredCount), sub: `${stats.totalPromotions} tổng cộng` },
    { title: "Doanh thu từ khuyến mãi", value: `${stats.totalRevenue?.toLocaleString()} đ`, sub: `${stats.totalUses} lượt sử dụng` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <div
          key={i}
          className="bg-slate-800 text-white p-4 rounded-2xl shadow"
        >
          <h3 className="text-sm opacity-80">{stat.title}</h3>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-orange-400">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
