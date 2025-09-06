import { RiAddLine } from "react-icons/ri";
import { useState } from "react";
import BookFilters from "./BookFilters";
import BookTable from "./BookTable";
import { Link } from "react-router-dom";

export default function OwnerBooks() {
  const [search, setSearch] = useState("");

  // demo data
  const books = [
    {
      id: 1,
      title: "Triết học cuộc sống",
      author: "Nguyễn Văn A",
      category: "Triết học",
      price: "150,000 VND",
      sold: 45,
      rating: 4.8,
      status: "Đang bán",
      cover: "https://via.placeholder.com/60x80.png?text=Book1",
    },
    {
      id: 2,
      title: "Kỹ năng giao tiếp",
      author: "Trần Thị B",
      category: "Kỹ năng sống",
      price: "120,000 VND",
      sold: 38,
      rating: 4.6,
      status: "Đang bán",
      cover: "https://via.placeholder.com/60x80.png?text=Book2",
    },
    {
      id: 3,
      title: "Hành trình phiêu lưu",
      author: "Lê Văn C",
      category: "Phiêu lưu",
      price: "80,000 VND",
      sold: 72,
      rating: 4.9,
      status: "Đang bán",
      cover: "https://via.placeholder.com/60x80.png?text=Book3",
    },
    {
      id: 4,
      title: "Đầu tư chứng khoán",
      author: "Phạm Thị D",
      category: "Tài chính",
      price: "200,000 VND",
      sold: 29,
      rating: 4.4,
      status: "Tạm dừng",
      cover: "https://via.placeholder.com/60x80.png?text=Book4",
    },
    {
      id: 5,
      title: "Tình yêu học trò",
      author: "Hoàng Văn E",
      category: "Tình cảm",
      price: "60,000 VND",
      sold: 156,
      rating: 4.7,
      status: "Đang bán",
      cover: "https://via.placeholder.com/60x80.png?text=Book5",
    },
  ];

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Sách</h1>
          <p className="text-gray-400">Quản lý toàn bộ sách của bạn</p>
        </div>
        <Link
          to="/owner/books/new"
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <RiAddLine className="mr-2" /> Thêm sách mới
        </Link>
      </div>

      {/* Bộ lọc */}
      <BookFilters search={search} setSearch={setSearch} />

      {/* Bảng sách */}
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
        <BookTable books={books} />
      </div>
    </div>
  );
}
