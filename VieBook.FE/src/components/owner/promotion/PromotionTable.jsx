import React from "react";
import { RiEdit2Line, RiDeleteBin6Line } from "react-icons/ri";

const promotions = [
  {
    name: "Giảm giá cuối tuần",
    book: "Đắc Nhân Tâm - Bản eBook Đặc Biệt",
    type: "30%",
    price: "150,000 đ → 105,000 đ",
    time: "15/1/2024 - 21/1/2024",
    status: "Đang hoạt động",
    effect: "24/100 lượt | Doanh thu: 2,520,000 đ",
  },
  {
    name: "Flash Sale Tháng 1",
    book: "Tư Duy Nhanh Và Chậm - Digital",
    type: "50.000 đ",
    price: "100,000 đ → 50,000 đ",
    time: "20/1/2024 - 25/1/2024",
    status: "Đang hoạt động",
    effect: "45/200 lượt | Doanh thu: 6,750,000 đ",
  },
];

export default function PromotionTable() {
  return (
    <div className="overflow-x-auto bg-slate-900 text-white rounded-2xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="p-3">Promotion & Sách</th>
            <th className="p-3">Loại & Giá trị</th>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Hiệu quả</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo, i) => (
            <tr
              key={i}
              className={`border-b border-slate-600 ${
                i % 2 === 0 ? "bg-slate-800" : "bg-slate-700"
              } hover:bg-slate-600 transition`}
            >
              <td className="p-3">
                <p className="font-semibold">{promo.name}</p>
                <p className="text-xs opacity-70">{promo.book}</p>
              </td>
              <td className="p-3">
                <p className="font-medium text-orange-400">{promo.type}</p>
                <p className="text-xs opacity-70">{promo.price}</p>
              </td>
              <td className="p-3">{promo.time}</td>
              <td className="p-3">
                <span className="bg-green-600 text-white px-2 py-1 rounded-lg text-xs">
                  {promo.status}
                </span>
              </td>
              <td className="p-3">{promo.effect}</td>
              <td className="p-3 flex gap-2 justify-center">
                <button className="p-2 bg-green-500 rounded hover:bg-green-600">
                  <RiEdit2Line />
                </button>
                <button className="p-2 bg-red-500 rounded hover:bg-red-600">
                  <RiDeleteBin6Line />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
