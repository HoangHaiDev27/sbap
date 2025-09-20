import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getBookById, getCategories, updateBook, uploadBookImage } from "../../api/ownerBookApi";

export default function BookEditForm() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    language: "",
    description: "",
    categoryIds: [],
    status: "Active",
  });

  const [coverUrl, setCoverUrl] = useState("");
  const [file, setFile] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isbnError, setIsbnError] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookData, catsData] = await Promise.all([
          getBookById(bookId),
          getCategories(),
        ]);

        const normalizedCats = catsData.map((c) => ({
          categoryId: c.categoryId ?? c.id ?? c.CategoryId ?? null,
          name: c.name ?? c.title ?? c.Name ?? "",
        })).filter(c => c.categoryId != null);

        setAllCategories(normalizedCats);

        let initialCategoryIds = [];

        if (Array.isArray(bookData.categoryIds) && bookData.categoryIds.length > 0) {
          initialCategoryIds = bookData.categoryIds.map((v) => Number(v));
        } else if (Array.isArray(bookData.categories) && bookData.categories.length > 0) {
          const nameList = bookData.categories;
          initialCategoryIds = nameList
            .map((name) => {
              const found = normalizedCats.find(
                (c) => String(c.name).toLowerCase() === String(name).toLowerCase()
              );
              return found ? Number(found.categoryId) : null;
            })
            .filter((v) => v != null);
        }

        setForm({
          title: bookData.title ?? "",
          author: bookData.author ?? "",
          isbn: bookData.isbn ?? "",
          language: bookData.language ?? "",
          description: bookData.description ?? "",
          categoryIds: initialCategoryIds,
          status: bookData.status ?? "Active",
          createdAt: bookData.createdAt ?? null,
        });

        setCoverUrl(bookData.coverUrl ?? "");
      } catch (err) {
        console.error("Lỗi khi load dữ liệu edit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  // submit PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let finalCoverUrl = coverUrl;

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        finalCoverUrl = await uploadBookImage(formData);
      }

      const payload = {
        bookId: Number(bookId),
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        description: form.description,
        language: form.language,
        coverUrl: finalCoverUrl,
        categoryIds: form.categoryIds,
        status: "Active",
        createdAt: form.createdAt,
      };

      await updateBook(bookId, payload);

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "success", message: "Cập nhật sách thành công!" }
      }));
      navigate("/owner/books");
    } catch (err) {
      const errorMsg = err?.message || err?.response?.data || "";
      if (errorMsg.includes("ISBN")) {
        setIsbnError("Mã ISBN đã tồn tại, vui lòng nhập mã khác.");
        window.dispatchEvent(new CustomEvent("app:toast", {
          detail: { type: "error", message: "Mã ISBN đã tồn tại, vui lòng nhập mã khác." }
        }));
      } else {
        window.dispatchEvent(new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Có lỗi khi cập nhật sách." }
        }));
      }
    } finally {
      setUploading(false);
    }
  };

  const selectedCategoryNames = () => {
    if (!form.categoryIds || form.categoryIds.length === 0) return "";
    return form.categoryIds
      .map((id) => allCategories.find((c) => Number(c.categoryId) === Number(id))?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa sách</h1>
          <p className="text-gray-400">Cập nhật thông tin sách</p>
        </div>
        <Link to="/owner/books" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
          ← Quay lại
        </Link>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu sách...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* title */}
            <div>
              <label className="block mb-2 text-sm font-medium">Tên sách *</label>
              <input name="title" value={form.title} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none" />
            </div>

            {/* author */}
            <div>
              <label className="block mb-2 text-sm font-medium">Tác giả *</label>
              <input name="author" value={form.author} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none" />
            </div>

            {/* isbn */}
            <div>
              <label className="block mb-2 text-sm font-medium">Mã ISBN *</label>
              <input
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded focus:outline-none ${isbnError ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"
                  }`}
              />
              {isbnError && <p className="text-red-400 text-sm">{isbnError}</p>}
            </div>

            {/* category*/}
            <div>
              <label className="block mb-2 text-sm font-medium">Thể loại *</label>
              <div className="w-full relative" ref={dropdownRef}>
                <div
                  className="w-full px-3 py-2 rounded bg-gray-700 cursor-pointer"
                  onClick={() => setShowCategoryDropdown((p) => !p)}
                >
                  {form.categoryIds.length > 0
                    ? selectedCategoryNames()
                    : "Chọn thể loại..."}
                </div>

                {showCategoryDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg max-h-56 overflow-y-auto">
                    {allCategories.map((c) => (
                      <label
                        key={c.categoryId}
                        className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.categoryIds.includes(Number(c.categoryId))}
                          onChange={() => handleCategoryToggle(Number(c.categoryId))}
                          className="mr-2"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* cover preview */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium">Ảnh bìa</label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center border-2 border-dashed border-gray-500 rounded-lg p-4 bg-gray-700">
                  <img
                    src={preview || coverUrl || "https://via.placeholder.com/120x160"}
                    alt="cover"
                    className="w-32 h-44 object-cover rounded mb-2"
                  />
                  <input id="coverInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <button type="button" onClick={() => document.getElementById("coverInput").click()} className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600">
                    Chọn ảnh mới
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  <p>Ảnh hiện tại sẽ được giữ nếu bạn không upload file thực sự lên server.</p>
                  <p>Nếu chọn ảnh mới, hệ thống sẽ upload lên Cloudinary khi bạn lưu thay đổi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ngôn ngữ  */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">Ngôn ngữ</label>
            <input
              name="language"
              value={form.language}
              onChange={handleChange}
              placeholder="Ví dụ: Vietnamese, VN, English..."
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>

          {/* description */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">Mô tả *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none" />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 ký tự</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className={`px-6 py-2 rounded-lg transition ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {uploading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
