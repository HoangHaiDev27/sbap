import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserId } from "../../api/authApi";
import { getCategories, createBook } from "../../api/ownerBookApi";


// Ảnh mặc định tạm thời
const TEMP_IMAGE_URL =
  "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474112AqI/anh-meme-ech-xanh_102045378.jpg";

export default function BookForm() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    categoryIds: [],
    language: "",
    description: "",
    coverUri: TEMP_IMAGE_URL, // mặc định
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const navigate = useNavigate();

  // load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // chọn/bỏ chọn category
  const handleCategoryToggle = (id) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((c) => c !== id)
          : [...prev.categoryIds, id],
      };
    });
  };

  // handle chọn ảnh từ máy
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setForm((prev) => ({ ...prev, coverUri: TEMP_IMAGE_URL })); // lưu mặc định
      };
      reader.readAsDataURL(file);
    }
  };

  // validate input
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Tên sách là bắt buộc";
    if (!form.author.trim()) errs.author = "Tác giả là bắt buộc";
    if (!form.categoryIds.length)
      errs.categoryIds = "Phải chọn ít nhất 1 thể loại";
    if (!form.description.trim()) errs.description = "Mô tả là bắt buộc";
    return errs;
  };

  // submit form
  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const ownerId = getUserId();
      if (!ownerId) {
        alert("Không tìm thấy user, vui lòng đăng nhập!");
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        coverUrl: form.coverUri || TEMP_IMAGE_URL,
        isbn: form.isbn,
        language: form.language || "Vietnamese",
        ownerId,
        categoryIds: form.categoryIds,
        status: "Active",
        author: form.author,
      };

      await createBook(payload);
      alert("Thêm sách thành công!");

      navigate("/owner/books");
    } catch (err) {
      console.error("Lỗi thêm sách:", err);
      alert("Không thể thêm sách!");
    }
  };

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
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tên sách..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Tác giả */}
          <div>
            <label className="block mb-2 text-sm font-medium">Tác giả *</label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Nhập tên tác giả..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
            {errors.author && (
              <p className="text-red-400 text-sm">{errors.author}</p>
            )}
          </div>

          {/* ISBN */}
          <div>
            <label className="block mb-2 text-sm font-medium">Mã ISBN</label>
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="Nhập mã ISBN..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Thể loại */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium">Thể loại *</label>
            <div
              className="w-full px-3 py-2 rounded bg-gray-700 cursor-pointer"
              onClick={() => setShowCategoryDropdown((prev) => !prev)}
            >
              {form.categoryIds.length > 0
                ? `${form.categoryIds.length} thể loại đã chọn`
                : "Chọn thể loại..."}
            </div>

            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                {categories.map((c) => (
                  <label
                    key={c.categoryId}
                    className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(c.categoryId)}
                      onChange={() => handleCategoryToggle(c.categoryId)}
                      className="mr-2"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}

            {errors.categoryIds && (
              <p className="text-red-400 text-sm">{errors.categoryIds}</p>
            )}
          </div>
        </div>

        {/* Ảnh bìa */}
        <div className="md:col-span-2 mt-6">
          <label className="block mb-2 text-sm font-medium">Ảnh bìa</label>
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-orange-500"
            onClick={() => document.getElementById("coverInput").click()}
          >
            <img
              src={preview || TEMP_IMAGE_URL}
              alt="Preview"
              className="w-40 h-56 object-cover rounded"
            />
            <p className="text-gray-400 mt-2">
              Ảnh sẽ luôn lưu bằng link mặc định
            </p>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Ngôn ngữ */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Ngôn ngữ</label>
          <input
            type="text"
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="Ví dụ: Vietnamese, English..."
            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>

        {/* Mô tả */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Mô tả *</label>
          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả nội dung sách..."
            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
          />
          {errors.description && (
            <p className="text-red-400 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
          >
            Lưu sách
          </button>
        </div>
      </div>
    </div>
  );
}
