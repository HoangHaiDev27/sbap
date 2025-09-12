import { Link } from "react-router-dom";

export default function BookForm() {
  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Thêm sách mới</h1>
          <p className="text-gray-400">Tạo sách mới</p>
        </div>
        <Link
          to="/owner/books"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Form */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên sách */}
          <div>
            <label className="block mb-2 text-sm font-medium">Tên sách *</label>
            <input
              type="text"
              placeholder="Nhập tên sách..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Tác giả */}
          <div>
            <label className="block mb-2 text-sm font-medium">Tác giả *</label>
            <input
              type="text"
              placeholder="Nhập tên tác giả..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="block mb-2 text-sm font-medium">Mã ISBN</label>
            <input
              type="text"
              placeholder="Nhập mã ISBN..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Mã sách quốc tế (nếu có)</p>
          </div>

          {/* Thể loại */}
          <div>
            <label className="block mb-2 text-sm font-medium">Thể loại *</label>
            <select className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none">
              <option>Chọn thể loại</option>
              <option>Triết học</option>
              <option>Kỹ năng sống</option>
              <option>Phiêu lưu</option>
            </select>
          </div>

          {/* Ảnh bìa */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Ảnh bìa *</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-orange-500">
              <p className="text-gray-400">Kéo thả ảnh hoặc nhấn để chọn</p>
              <button className="mt-3 px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition">
                Chọn ảnh bìa
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Tags</label>
          <input
            type="text"
            placeholder="Ví dụ: triết học, tự phát triển..."
            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>

        {/* Mô tả */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Mô tả *</label>
          <textarea
            rows={4}
            placeholder="Mô tả nội dung sách..."
            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">0/500 ký tự</p>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition">
            Lưu sách
          </button>
        </div>
      </div>
    </div>
  );
}
