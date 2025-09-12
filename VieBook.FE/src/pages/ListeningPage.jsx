import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import ListeningCard from "../components/listening/ListeningCard";
import ListeningModal from "../components/listening/ListeningModal";

const sampleData = [
  {
    id: 1,
    title: "Đường Về Chân Hạnh Phúc",
    author: "Như Nhiên Thích Tánh Tuệ",
    channel: "SaigonBooks",
    reader: "Dạ Thính Vũ",
    duration: "3 giờ 24 phút 7 giây",
    progress: 0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    title: "Hành Trình Về Phương Đông",
    author: "Nguyên Phong",
    channel: "First News",
    reader: "MC Hải Yến",
    duration: "4 giờ 10 phút",
    progress: 30,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    title: "Muôn Kiếp Nhân Sinh",
    author: "Nguyên Phong",
    channel: "NXB Tổng Hợp",
    reader: "Đông Quân",
    duration: "6 giờ 25 phút",
    progress: 50,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    title: "Không Gia Đình",
    author: "Hector Malot",
    channel: "NXB Kim Đồng",
    reader: "Hoài Nam",
    duration: "9 giờ 12 phút",
    progress: 80,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    channel: "NXB Trẻ",
    reader: "Ánh Dương",
    duration: "5 giờ 00 phút",
    progress: 10,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 6,
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    channel: "NXB Văn Học",
    reader: "Minh Hằng",
    duration: "3 giờ 45 phút",
    progress: 70,
    image: "https://via.placeholder.com/150",
  },
];

function ListeningPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(sampleData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sampleData.slice(startIndex, startIndex + itemsPerPage);

  const handleOpen = (item) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <div>
        <div className="flex items-start justify-between mb-6">
          {/* Left side */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Nội dung đang nghe</h1>
            <p className="text-gray-400">
              Theo dõi tiến độ nghe và tiếp tục hành trình của bạn
            </p>
          </div>

          {/* Right side */}
          <button className="flex items-center space-x-1 text-gray-300 hover:text-red-400">
            <RiDeleteBin6Line />
            <span>Xóa tất cả</span>
          </button>
        </div>

        <div className="space-y-4">
          {currentItems.map((item) => (
            <ListeningCard key={item.id} item={item} onClick={handleOpen} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      <ListeningModal
        open={open}
        item={selected}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default ListeningPage;
