import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getBookById, getCategories, updateBook, uploadBookImage, uploadCertificate, removeOldBookImage } from "../../api/ownerBookApi";

export default function BookEditForm() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    categoryIds: [],
    status: "Active",
    uploaderType: null,
    uploadStatus: null,
    completionStatus: null,
    createdAt: null,
  });

  const [coverUrl, setCoverUrl] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [file, setFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isbnError, setIsbnError] = useState("");
  const [errors, setErrors] = useState({});

  const dropdownRef = useRef(null);

  // đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCategoryDropdown]);

  // load dữ liệu sách & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookData, catsData] = await Promise.all([
          getBookById(bookId),
          getCategories(),
        ]);

        const normalizedCats = catsData
          .map((c) => ({
            categoryId: c.categoryId ?? c.id ?? c.CategoryId ?? null,
            name: c.name ?? c.title ?? c.Name ?? "",
          }))
          .filter((c) => c.categoryId != null);

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
          description: bookData.description ?? "",
          categoryIds: initialCategoryIds,
          status: bookData.status ?? "Active",
          uploaderType: bookData.uploaderType ?? null,
          uploadStatus: bookData.uploadStatus ?? null,
          completionStatus: bookData.completionStatus ?? null,
          createdAt: bookData.createdAt ?? null,
        });

        setCoverUrl(bookData.coverUrl ?? "");
        setCertificateUrl(bookData.certificateUrl ?? "");
      } catch (err) {
        // Error loading data
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selected);
  };

  const handleCertFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setCertFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCertPreview(reader.result);
    };
    reader.readAsDataURL(selected);
  };

  // validate dữ liệu nhập
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Tên sách là bắt buộc";
    if (!form.author.trim()) errs.author = "Tác giả là bắt buộc";
    if (form.isbn.length > 20) {
      errs.isbn = "Mã ISBN không được vượt quá 20 ký tự";
    }
    if (!form.description.trim()) errs.description = "Mô tả là bắt buộc";
    if (!form.categoryIds.length) errs.categoryIds = "Phải chọn ít nhất 1 thể loại";
    return errs;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setUploading(true);

    let finalCoverUrl = coverUrl;
    let finalCertUrl = certificateUrl;

    try {
      if (file) {
        if (coverUrl) {
          try {
            await removeOldBookImage(coverUrl);
          } catch (err) {
            // Failed to remove old image
          }
        }

        const formData = new FormData();
        formData.append("file", file);
        finalCoverUrl = await uploadBookImage(formData);
      }

      if (certFile) {
        const certFormData = new FormData();
        certFormData.append("file", certFile);
        finalCertUrl = await uploadCertificate(certFormData);
      }

      const payload = {
        bookId: Number(bookId),
        title: form.title,
        author: form.author,
        isbn: form.isbn?.trim() || null,
        description: form.description,
        language: null, // luôn lưu NULL
        coverUrl: finalCoverUrl,
        certificateUrl: finalCertUrl || null,
        categoryIds: form.categoryIds,
        status: "Active",
        uploaderType: form.uploaderType,
        uploadStatus: form.uploadStatus,
        completionStatus: form.completionStatus,
        createdAt: form.createdAt,
      };

      await updateBook(bookId, payload);

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "success", message: "Cập nhật sách thành công!" }
      }));
      navigate("/owner/books");
    } catch (err) {
      const errorMsg = err?.message || "";
      const status = err?.status;
      
      // Only treat as ISBN error if it's a Conflict (409) status or explicitly mentions ISBN
      if (status === 409 || (errorMsg.includes("ISBN") && errorMsg.includes("tồn tại"))) {
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
              {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
            </div>

            {/* author */}
            <div>
              <label className="block mb-2 text-sm font-medium">Tác giả *</label>
              <input name="author" value={form.author} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none" />
              {errors.author && <p className="text-red-400 text-sm">{errors.author}</p>}
            </div>

            {/* isbn */}
            <div>
              <label className="block mb-2 text-sm font-medium">Mã ISBN</label>
              <input
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded focus:outline-none ${isbnError ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"}`}
              />
              {isbnError && <p className="text-red-400 text-sm">{isbnError}</p>}
              {errors.isbn && <p className="text-red-400 text-sm">{errors.isbn}</p>}
            </div>

            {/* category */}
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
              {errors.categoryIds && <p className="text-red-400 text-sm">{errors.categoryIds}</p>}
            </div>

            {/* cover preview (giống bên Add) */}
            <div className="md:col-span-2 mt-6">
              <label className="block mb-2 text-sm font-medium">Ảnh bìa*</label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-orange-500"
                onClick={() => document.getElementById("coverInput").click()}
              >
                <img
                  src={preview || coverUrl || "https://placehold.co/200x300?text=No+Image"}
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
            </div>

            {/* certificate upload/replace */}
            <div className="md:col-span-2 mt-6">
              <label className="block mb-2 text-sm font-medium">Giấy chứng nhận</label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-blue-500"
                onClick={() => document.getElementById("certInput").click()}
              >
                {certPreview || certificateUrl ? (
                  (certPreview || certificateUrl).toLowerCase().endsWith('.pdf') ? (
                    <div className="text-center">
                      <div className="text-6xl mb-2">📄</div>
                      <p className="text-gray-400 text-sm mb-2">Tài liệu PDF</p>
                      {certPreview ? (
                        <p className="text-green-400 text-sm">Tài liệu mới đã chọn</p>
                      ) : (
                        <a
                          href={certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Xem chứng chỉ
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <img
                        src={certPreview || certificateUrl}
                        alt="Certificate"
                        className="max-w-full max-h-60 object-contain rounded"
                      />
                      {certPreview && (
                        <p className="text-green-400 text-sm mt-2">Ảnh mới đã chọn</p>
                      )}
                      {!certPreview && certificateUrl && (
                        <a
                          href={certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline mt-2"
                        >
                          Xem ở trang mới
                        </a>
                      )}
                    </>
                  )
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">📄</div>
                    <p className="text-gray-400 text-sm">Click để chọn file giấy chứng nhận</p>
                    <p className="text-xs text-gray-500 mt-1">(PNG, JPG, PDF)</p>
                  </div>
                )}
                <input
                  id="certInput"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleCertFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Upload giấy chứng nhận bản quyền hoặc giấy phép phân phối hợp pháp
              </p>
            </div>
          </div>

          {/* description */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">Mô tả *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={10}
              className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none" />
            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`px-6 py-2 rounded-lg transition ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
            >
              {uploading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
