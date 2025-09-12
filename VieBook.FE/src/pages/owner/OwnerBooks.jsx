import { RiAddLine } from "react-icons/ri";
import { useState } from "react";
import BookFilters from "../../components/owner/book/BookFilters";
import BookTable from "../../components/owner/book/BookTable";
import { Link } from "react-router-dom";

export default function OwnerBooks() {
  const [search, setSearch] = useState("");

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
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
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
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
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
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
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
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
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
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
  },
  {
    id: 6,
    title: "Tư duy phản biện",
    author: "Ngô Thị F",
    category: "Phát triển bản thân",
    price: "110,000 VND",
    sold: 64,
    rating: 4.5,
    status: "Đang bán",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
  },
  {
    id: 7,
    title: "Lập trình căn bản",
    author: "Trịnh Văn G",
    category: "Công nghệ",
    price: "175,000 VND",
    sold: 41,
    rating: 4.3,
    status: "Đang bán",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
  },
  {
    id: 8,
    title: "Lãnh đạo theo phong cách mới",
    author: "Lý Thị H",
    category: "Kinh doanh",
    price: "190,000 VND",
    sold: 50,
    rating: 4.6,
    status: "Tạm dừng",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
  },
  {
    id: 9,
    title: "Ẩm thực bốn phương",
    author: "Mai Văn I",
    category: "Ẩm thực",
    price: "95,000 VND",
    sold: 80,
    rating: 4.9,
    status: "Đang bán",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
  },
  {
    id: 10,
    title: "Thế giới động vật",
    author: "Bùi Thị J",
    category: "Khoa học",
    price: "130,000 VND",
    sold: 33,
    rating: 4.2,
    status: "Đang bán",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
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
