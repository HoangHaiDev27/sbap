import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function BookEditForm() {
  const { bookId } = useParams();

  // ✅ Khởi tạo form rỗng để đảm bảo gọi hook đúng thứ tự
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    tags: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ Giả lập API call
  useEffect(() => {
    setLoading(true);
    const mockBook = {
      id: bookId,
      title: "Triết học cuộc sống",
      author: "Nguyễn Văn A",
      isbn: "978-1234567890",
      category: "Triết học",
      tags: "triết học, phát triển bản thân",
      description: "Một cuốn sách truyền cảm hứng sống ý nghĩa.",
    };

    // Giả lập delay
    setTimeout(() => {
      setForm(mockBook);
      setLoading(false);
    }, 500);
  }, [bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📦 Dữ liệu đã sửa:", form);
    // TODO: Gửi request PUT/PATCH đến API backend
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa sách</h1>
          <p className="text-gray-400">Cập nhật thông tin sách</p>
        </div>
        <Link
          to="/owner/books"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <p>Đang tải dữ liệu sách...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-lg shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên sách */}
            <div>
              <label className="block mb-2 text-sm font-medium">Tên sách *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
              />
            </div>

            {/* Tác giả */}
            <div>
              <label className="block mb-2 text-sm font-medium">Tác giả *</label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block mb-2 text-sm font-medium">Mã ISBN</label>
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
              />
            </div>

            {/* Thể loại */}
            <div>
              <label className="block mb-2 text-sm font-medium">Thể loại *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
              >
                <option value="">Chọn thể loại</option>
                <option value="Triết học">Triết học</option>
                <option value="Kỹ năng sống">Kỹ năng sống</option>
                <option value="Phiêu lưu">Phiêu lưu</option>
              </select>
            </div>

            {/* Ảnh bìa (giữ nguyên nếu không có upload) */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium">Ảnh bìa *</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-orange-500">
                <p className="text-gray-400">Hiện tại chưa hỗ trợ chỉnh ảnh</p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                >
                  Chọn ảnh mới
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">Tags</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Ví dụ: triết học, phát triển bản thân"
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Mô tả */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">Mô tả *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả nội dung sách..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length}/500 ký tự
            </p>
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
