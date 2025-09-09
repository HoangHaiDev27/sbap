import React from "react";

const stats = [
  { title: "Promotion đang hoạt động", value: "3", sub: "+2 so với tuần trước" },
  { title: "Đã lên lịch", value: "1", sub: "Sắp tới trong tháng" },
  { title: "Tổng doanh thu từ promotion", value: "33M", sub: "+15% so với tháng trước" },
  { title: "Tổng lượt sử dụng", value: "243", sub: "Từ 5 promotion" },
];

export default function PromotionStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
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
