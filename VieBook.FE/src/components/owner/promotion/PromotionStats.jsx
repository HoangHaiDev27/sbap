import React, { useEffect, useState } from "react";
import { getPromotionStats } from "../../../api/promotionApi";
import { getUserId } from "../../../api/authApi";

export default function PromotionStats({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ownerId = getUserId();
    if (!ownerId) return;
    getPromotionStats(ownerId)
      .then(setStats)
      .catch((e) => setError(e.message || "Lỗi lấy thống kê"));
  }, [refreshTrigger]); // Re-fetch khi refreshTrigger thay đổi

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-slate-800 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow animate-pulse h-20 sm:h-24" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Đang hoạt động", value: String(stats.activeCount), sub: `${stats.totalPromotions} khuyến mãi` },
    { title: "Sắp diễn ra", value: String(stats.upcomingCount), sub: `${stats.totalBooksApplied} sách áp dụng` },
    { title: "Đã kết thúc", value: String(stats.expiredCount), sub: `${stats.totalPromotions} tổng cộng` },
    { title: "Doanh thu từ khuyến mãi", value: `${stats.totalRevenue?.toLocaleString()} xu`, sub: `${stats.totalUses} lượt sử dụng` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((stat, i) => (
        <div
          key={i}
          className={`bg-slate-800 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow ${i === 3 ? 'col-span-2 lg:col-span-1' : ''}`}
        >
          <h3 className="text-xs sm:text-sm opacity-80 mb-1 sm:mb-2 line-clamp-2">{stat.title}</h3>
          <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
          <p className="text-xs text-orange-400 mt-1 truncate">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
