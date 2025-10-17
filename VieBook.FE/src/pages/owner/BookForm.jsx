import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../api/authApi";
import { getCategories, createBook, uploadBookImage } from "../../api/ownerBookApi";

export default function BookForm() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    categoryIds: [],
    description: "",
    coverUri: "",
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isbnError, setIsbnError] = useState("");
  const [uploading, setUploading] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "isbn") setIsbnError("");
  };

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

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  // validate input
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Tên sách là bắt buộc";
    if (!form.author.trim()) errs.author = "Tác giả là bắt buộc";
    if (!form.categoryIds.length) errs.categoryIds = "Phải chọn ít nhất 1 thể loại";
    if (!form.description.trim()) errs.description = "Mô tả là bắt buộc";
    if (!file) errs.cover = "Ảnh bìa là bắt buộc";
    if (form.isbn && form.isbn.length > 20) {
      errs.isbn = "Mã ISBN không được vượt quá 20 ký tự";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const ownerId = getUserId();
      if (!ownerId) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "error",
              message: "Không tìm thấy user, vui lòng đăng nhập!",
            },
          })
        );
        return;
      }

      setUploading(true);
      let coverUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        coverUrl = await uploadBookImage(formData);
      }
      setUploading(false);

      const payload = {
        title: form.title,
        description: form.description,
        coverUrl,
        isbn: form.isbn?.trim() || null,
        language: null,
        ownerId,
        categoryIds: form.categoryIds,
        status: "Active",
        author: form.author,
      };

      await createBook(payload);

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Thêm sách thành công!" },
        })
      );

      navigate("/owner/books");
    } catch (err) {
      if (err.message.includes("ISBN")) {
        setIsbnError("Mã ISBN đã tồn tại, vui lòng nhập mã khác.");
      }
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Không thể thêm sách!" },
        })
      );
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
        {/* Nút quay lại đã bỏ */}
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
            {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
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
            {errors.author && <p className="text-red-400 text-sm">{errors.author}</p>}
          </div>

          {/* ISBN */}
          <div>
            <label className="block mb-2 text-sm font-medium">Mã ISBN </label>
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="Nhập mã ISBN..."
              className={`w-full px-3 py-2 rounded focus:outline-none ${isbnError || errors.isbn ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"}`}
            />
            {(isbnError || errors.isbn) && (
              <p className="text-red-400 text-sm">{isbnError || errors.isbn}</p>
            )}
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
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg max-h-40 overflow-y-auto"
              >
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
            {errors.categoryIds && <p className="text-red-400 text-sm">{errors.categoryIds}</p>}
          </div>
        </div>

        {/* Ảnh bìa */}
        <div className="md:col-span-2 mt-6">
          <label className="block mb-2 text-sm font-medium">Ảnh bìa*</label>
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-orange-500"
            onClick={() => document.getElementById("coverInput").click()}
          >
            <img
              src={preview || "https://placehold.co/200x300?text=No+Image"}
              alt="Preview"
              className="w-40 h-56 object-cover rounded"
            />
            <p className="text-gray-400 mt-2">
              Chọn ảnh từ máy, sẽ upload khi lưu
            </p>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {errors.cover && <p className="text-red-400 text-sm mt-2">{errors.cover}</p>}
        </div>

        {/* Mô tả */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Mô tả *</label>
          <textarea
            rows={8}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả nội dung sách..."
            className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
          />
          {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
        </div>

        {/* Submit & Cancel */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`px-6 py-2 rounded-lg transition ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
          >
            {uploading ? "Đang tạo..." : "Tạo sách"}
          </button>
        </div>
      </div>
    </div>
  );
}
