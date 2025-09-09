import {
  RiAddLine,
  RiBook2Line,
  RiCheckLine,
  RiGiftLine,
  RiDraftLine,
  RiEdit2Line,
  RiEyeLine,
  RiDeleteBin6Line,
} from "react-icons/ri";
import { Link, useParams } from "react-router-dom";

export default function OwnerChapters() {
  const { bookId } = useParams(); // lấy id sách từ URL

  // Demo data
  const chapters = [
    { id: 1, title: "Chương 1: Khởi đầu cuộc hành trình", words: 2500, status: "Đã xuất bản", free: true, preview: true, price: 0, date: "15/1/2024" },
    { id: 2, title: "Chương 2: Gặp gỡ những người bạn mới", words: 3200, status: "Đã xuất bản", free: false, preview: false, price: 5000, date: "16/1/2024" },
    { id: 3, title: "Chương 3: Thách thức đầu tiên", words: 2800, status: "Nháp", free: false, preview: false, price: 5000, date: "—" },
  ];

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Chương</h1>
          <p className="text-gray-400">Truyện: Triết học cuộc sống</p>
        </div>

        <Link
          to={`/owner/books/${bookId}/chapters/new`}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <RiAddLine className="mr-2" /> Thêm chương mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiBook2Line size={28} className="text-blue-400" />
          <div>
            <p className="text-xl font-bold">3</p>
            <p className="text-sm text-gray-400">Tổng chương</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiCheckLine size={28} className="text-green-400" />
          <div>
            <p className="text-xl font-bold">2</p>
            <p className="text-sm text-gray-400">Đã xuất bản</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiGiftLine size={28} className="text-yellow-400" />
          <div>
            <p className="text-xl font-bold">1</p>
            <p className="text-sm text-gray-400">Chương miễn phí</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiDraftLine size={28} className="text-purple-400" />
          <div>
            <p className="text-xl font-bold">1</p>
            <p className="text-sm text-gray-400">Nháp</p>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách chương</h2>
        <div className="space-y-3">
          {chapters.map((ch, index) => (
            <div
              key={ch.id}
              className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 flex items-center justify-center bg-orange-500 rounded-full text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{ch.title}</p>
                  <p className="text-xs text-gray-400">
                    {ch.words} từ • {ch.status}{" "}
                    {ch.free && (
                      <span className="ml-2 px-2 py-0.5 bg-green-600 rounded text-xs">
                        Miễn phí
                      </span>
                    )}
                    {ch.preview && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 rounded text-xs">
                        Đọc thử
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {ch.price > 0 && (
                  <span className="text-orange-400 font-semibold">
                    {ch.price.toLocaleString()} VND
                  </span>
                )}
                <span className="text-sm text-gray-400">{ch.date}</span>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 bg-green-500 rounded text-xs hover:bg-green-600">
                    Sửa
                  </button>
                  <button className="px-2 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600">
                    Xem
                  </button>
                  <button className="px-2 py-1 bg-red-500 rounded text-xs hover:bg-red-600">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
