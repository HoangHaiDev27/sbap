import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ChapterForm() {
  const { bookId } = useParams();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(5000);
  const [status, setStatus] = useState("Nháp");
  const [isFree, setIsFree] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState("");

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          to={`/owner/books/${bookId}/chapters`}
          className="mr-4 text-gray-400 hover:text-white"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Thêm chương mới</h1>
          <p className="text-gray-400">Truyện: Triết học cuộc sống</p>
        </div>
      </div>

      {/* Thông tin chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin chương</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tiêu đề */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Tiêu đề chương *</label>
            <input
              type="text"
              placeholder="Ví dụ: Chương 1: Khởi đầu cuộc hành trình"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Chương miễn phí */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            <span>Chương miễn phí</span>
          </div>

          {/* Giá chương */}
          <div>
            <label className="block text-sm mb-1">Giá chương (VND)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Cho phép đọc thử */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
            />
            <span>Cho phép đọc thử</span>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            >
              <option>Nháp</option>
              <option>Đã xuất bản</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nội dung chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Nội dung chương</h2>
        <textarea
          placeholder="Nhập nội dung chương..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
        />
        <div className="text-right text-xs text-gray-400 mt-2">
          {content.length}/50000 ký tự
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <Link
          to={`/owner/books/${bookId}/chapters`}
          className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
        >
          Hủy
        </Link>
        <button className="px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600">
          Lưu chương
        </button>
      </div>
    </div>
  );
}
