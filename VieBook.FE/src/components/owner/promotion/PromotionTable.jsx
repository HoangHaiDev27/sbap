import React, { useState } from "react";
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
  {
    name: "Khuyến mãi Tết Nguyên Đán",
    book: "Bí mật tư duy triệu phú",
    type: "20%",
    price: "120,000 đ → 96,000 đ",
    time: "01/2/2024 - 14/2/2024",
    status: "Sắp diễn ra",
    effect: "0/150 lượt | Doanh thu: 0 đ",
  },
  {
    name: "Giảm giá mùa xuân",
    book: "Sống tối giản",
    type: "25%",
    price: "80,000 đ → 60,000 đ",
    time: "10/2/2024 - 20/2/2024",
    status: "Đang hoạt động",
    effect: "10/50 lượt | Doanh thu: 600,000 đ",
  },
  {
    name: "Sale 50k duy nhất 1 ngày",
    book: "Thiết kế cuộc đời thịnh vượng",
    type: "50,000 đ",
    price: "100,000 đ → 50,000 đ",
    time: "25/2/2024",
    status: "Kết thúc",
    effect: "89/100 lượt | Doanh thu: 4,450,000 đ",
  },
  {
    name: "Sale ngày sách Việt Nam",
    book: "Dám nghĩ lớn",
    type: "15%",
    price: "200,000 đ → 170,000 đ",
    time: "21/4/2024 - 23/4/2024",
    status: "Đang hoạt động",
    effect: "33/100 lượt | Doanh thu: 5,610,000 đ",
  },
  {
    name: "Black Friday",
    book: "Marketing giỏi phải kiếm được tiền",
    type: "40%",
    price: "300,000 đ → 180,000 đ",
    time: "29/11/2024",
    status: "Sắp diễn ra",
    effect: "0/300 lượt | Doanh thu: 0 đ",
  },
  {
    name: "Cyber Monday",
    book: "Nghệ thuật đàm phán",
    type: "35%",
    price: "220,000 đ → 143,000 đ",
    time: "02/12/2024",
    status: "Kết thúc",
    effect: "102/150 lượt | Doanh thu: 14,586,000 đ",
  },
];

const ITEMS_PER_PAGE = 5;

export default function PromotionTable() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
  const currentData = promotions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
          {currentData.map((promo, i) => (
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

      {/* Phân trang */}
      <div className="flex justify-end items-center gap-2 p-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm"
        >
          ←
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded text-sm ${
              page === i + 1
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm"
        >
          →
        </button>
      </div>
    </div>
  );
}
