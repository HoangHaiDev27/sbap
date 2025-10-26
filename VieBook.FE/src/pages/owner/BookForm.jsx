import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserId, getCurrentUser, fetchCurrentUserProfile } from "../../api/authApi";
import { getCategories, createBook, uploadBookImage, uploadCertificate } from "../../api/ownerBookApi";
import BookTermsModal from "../../components/owner/book/BookTermsModal";
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine } from "react-icons/ri";

export default function BookForm() {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0); // 0: terms, 1: uploader type, 2: upload status, 3: form
  const [showTermsModal, setShowTermsModal] = useState(true);
  
  // Form data
  const [categories, setCategories] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    categoryIds: [],
    description: "",
    coverUri: "",
    uploaderType: "Owner", // Owner or Seller
    uploadStatus: "Incomplete", // Incomplete or Full
    bookStatus: null, // PendingChapters (Chờ đăng chương) for Full
    certificateFile: null,
  });
  
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isbnError, setIsbnError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBookId, setCreatedBookId] = useState(null);

  const dropdownRef = useRef(null);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load categories and user profile
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Fetch user profile from API (to get UserProfile.FullName from database)
        const userProfile = await fetchCurrentUserProfile();
        setUserProfile(userProfile);
        
        // Không tự động set author - chỉ set khi user chọn "Tác giả" (Owner)
      } catch (err) {
        console.error("Lỗi load data:", err);
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "error", message: "Không thể tải dữ liệu!" },
          })
        );
      }
    };
    loadData();
  }, []);

  // Accept terms and move to step 1
  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    setCurrentStep(1);
  };

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

  const handleCoverFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setCoverFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleCertificateFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setForm((prev) => ({ ...prev, certificateFile: selected }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  // Validate step 3 (form)
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Tên sách là bắt buộc";
    if (!form.author.trim()) errs.author = "Tác giả là bắt buộc";
    if (!form.categoryIds.length) errs.categoryIds = "Phải chọn ít nhất 1 thể loại";
    if (!form.description.trim()) errs.description = "Mô tả là bắt buộc";
    if (!coverFile) errs.cover = "Ảnh bìa là bắt buộc";
    if (form.isbn && form.isbn.length > 20) {
      errs.isbn = "Mã ISBN không được vượt quá 20 ký tự";
    }
    // If Seller, ISBN is required
    if (form.uploaderType === "Seller" && !form.isbn.trim()) {
      errs.isbn = "Mã ISBN là bắt buộc đối với người bán";
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
      
      // Upload cover image
      let coverUrl = null;
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        coverUrl = await uploadBookImage(formData);
      }

      // Upload certificate if Seller
      let certificateUrl = null;
      if (form.uploaderType === "Seller" && form.certificateFile) {
        const certData = new FormData();
        certData.append("file", form.certificateFile);
        certificateUrl = await uploadCertificate(certData); // Upload to certificate endpoint
      }

      // Luôn set Status = PendingChapters và CompletionStatus = Ongoing cho tất cả trường hợp
      const payload = {
        title: form.title,
        description: form.description,
        coverUrl,
        isbn: form.isbn?.trim() || null,
        language: null,
        ownerId,
        categoryIds: form.categoryIds,
        status: "PendingChapters", // Luôn là PendingChapters
        author: form.author,
        uploaderType: form.uploaderType,
        uploadStatus: form.uploadStatus,
        completionStatus: "Ongoing", // Luôn là Ongoing
        certificateUrl,
      };

      const result = await createBook(payload);
      
      // Lấy bookId từ response (có thể là result.bookId hoặc result)
      const bookId = result?.bookId || result?.data?.bookId || result;
      
      setUploading(false);
      setCreatedBookId(bookId);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error creating book:", err);
      setUploading(false);
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

  // Render Step 1: Choose Uploader Type
  const renderStep1 = () => (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Bước 1: Chọn loại người đăng tải
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner */}
        <button
          onClick={() => {
            const fullName = userProfile?.profile?.fullName 
              || userProfile?.email 
              || "Tác giả";
            setForm((prev) => ({ ...prev, uploaderType: "Owner", author: fullName }));
            setCurrentStep(2);
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            form.uploaderType === "Owner"
              ? "border-green-500 bg-green-500/20"
              : "border-gray-600 hover:border-green-400"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Tác giả</h3>
            <p className="text-gray-400 text-sm">
              Bạn là tác giả của cuốn sách này. Tên tác giả sẽ tự động được gán theo tên của bạn.
            </p>
          </div>
        </button>

        {/* Seller */}
        <button
          onClick={() => {
            setForm((prev) => ({ ...prev, uploaderType: "Seller", author: "" }));
            setCurrentStep(2);
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            form.uploaderType === "Seller"
              ? "border-green-500 bg-green-500/20"
              : "border-gray-600 hover:border-green-400"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-white mb-2">Người bán</h3>
            <p className="text-gray-400 text-sm">
              Bạn bán sách của tác giả khác. Cần cung cấp mã ISBN và giấy chứng nhận bản quyền.
            </p>
          </div>
        </button>
      </div>

      <div className="mt-6 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition flex items-center gap-2"
        >
          <RiArrowLeftLine />
          Quay lại
        </button>
      </div>
    </div>
  );

  // Render Step 2: Choose Upload Status
  const renderStep2 = () => (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Bước 2: Trạng thái đăng tải
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incomplete */}
        <button
          onClick={() => {
            setForm((prev) => ({ ...prev, uploadStatus: "Incomplete", bookStatus: null }));
            setCurrentStep(3);
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            form.uploadStatus === "Incomplete"
              ? "border-orange-500 bg-orange-500/20"
              : "border-gray-600 hover:border-orange-400"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa trọn bộ</h3>
            <p className="text-gray-400 text-sm">
              Sách đang cập nhật, chưa hoàn thành. Bạn sẽ thêm chương dần dần.
            </p>
            <div className="mt-4 text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <p className="font-medium">Trạng thái: Chờ đăng chương • Đang ra</p>
              <p className="text-xs mt-1">Bạn có thể đăng chương dần dần. Sách sẽ cần kiểm duyệt để hiển thị lên web.</p>
            </div>
          </div>
        </button>

        {/* Full */}
        <button
          onClick={() => {
            setForm((prev) => ({ ...prev, uploadStatus: "Full", bookStatus: "PendingChapters" }));
            setCurrentStep(3);
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            form.uploadStatus === "Full"
              ? "border-green-500 bg-green-500/20"
              : "border-gray-600 hover:border-green-400"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white mb-2">Đã trọn bộ</h3>
            <p className="text-gray-400 text-sm">
              Sách đã hoàn thành, đầy đủ tất cả các chương. Sẵn sàng xuất bản.
            </p>
            <div className="mt-4 text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <p className="font-medium">Trạng thái: Chờ đăng chương • Đang ra</p>
              <p className="text-xs mt-1">Cần đăng hết chương mới có thể kiểm duyệt để hiển thị lên web.</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition flex items-center gap-2"
        >
          <RiArrowLeftLine />
          Quay lại
        </button>
      </div>
    </div>
  );

  // Render Step 3: Book Form
  const renderStep3 = () => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Bước 3: Thông tin sách</h2>
      
      {/* Progress indicator */}
      <div className="mb-6 bg-gray-700/50 p-4 rounded-lg">
        <p className="text-gray-400 text-xs mb-3 text-center">Thông tin đã chọn</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Uploader Type */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            form.uploaderType === "Owner" 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}>
            <span className="text-lg">{form.uploaderType === "Owner" ? "✍️" : "🏪"}</span>
            <span>{form.uploaderType === "Owner" ? "Tác giả" : "Người bán"}</span>
          </div>
          
          {/* Upload Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            form.uploadStatus === "Full" 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          }`}>
            <span className="text-lg">{form.uploadStatus === "Full" ? "✅" : "📝"}</span>
            <span>{form.uploadStatus === "Full" ? "Đã trọn bộ" : "Chưa trọn bộ"}</span>
          </div>
          
          {/* Book Status - Luôn hiển thị PendingChapters */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <span className="text-lg">⏳</span>
            <span>Chờ đăng chương</span>
          </div>
          
          {/* Completion Status - Chỉ hiển thị khi Incomplete */}
          {form.uploadStatus === "Incomplete" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <span className="text-lg">📖</span>
              <span>Đang ra</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên sách */}
        <div>
          <label className="block mb-2 text-sm font-medium text-white">Tên sách *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nhập tên sách..."
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Tác giả */}
        <div>
          <label className="block mb-2 text-sm font-medium text-white">Tác giả *</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Nhập tên tác giả..."
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {form.uploaderType === "Owner" && form.author && form.author.includes("@") && (
            <div className="mt-1 p-2 bg-yellow-500/20 border border-yellow-500 rounded">
              <p className="text-xs text-yellow-400">
                ⚠️ Đang dùng email làm tên tác giả. 
                <a 
                  href="/profile" 
                  target="_blank"
                  className="underline ml-1 hover:text-yellow-300"
                >
                  Cập nhật tên đầy đủ trong Profile
                </a>
              </p>
            </div>
          )}
          {errors.author && <p className="text-red-400 text-sm mt-1">{errors.author}</p>}
        </div>

        {/* ISBN - Required for Seller */}
        {form.uploaderType === "Seller" && (
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Mã ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="Nhập mã ISBN..."
              className={`w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isbnError || errors.isbn ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"
              } text-white`}
            />
            {(isbnError || errors.isbn) && (
              <p className="text-red-400 text-sm mt-1">{isbnError || errors.isbn}</p>
            )}
          </div>
        )}

        {/* ISBN - Optional for Owner */}
        {form.uploaderType === "Owner" && (
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Mã ISBN (tùy chọn)</label>
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="Nhập mã ISBN..."
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.isbn && <p className="text-red-400 text-sm mt-1">{errors.isbn}</p>}
          </div>
        )}

        {/* Thể loại */}
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-white">Thể loại *</label>
          <div
            className="w-full px-3 py-2 rounded bg-gray-700 text-white cursor-pointer hover:bg-gray-600"
            onClick={() => setShowCategoryDropdown((prev) => !prev)}
          >
            {form.categoryIds.length > 0
              ? `${form.categoryIds.length} thể loại đã chọn`
              : "Chọn thể loại..."}
          </div>

          {showCategoryDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-xl"
            >
              {categories.length > 0 ? (
                categories.map((c) => (
                  <label
                    key={c.categoryId}
                    className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer text-white"
                  >
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(c.categoryId)}
                      onChange={() => handleCategoryToggle(c.categoryId)}
                      className="mr-2"
                    />
                    {c.name}
                  </label>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400 text-center">
                  Đang tải danh mục...
                </div>
              )}
            </div>
          )}
          {errors.categoryIds && <p className="text-red-400 text-sm mt-1">{errors.categoryIds}</p>}
        </div>
      </div>

      {/* Ảnh bìa */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-white">Ảnh bìa *</label>
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-green-500"
          onClick={() => document.getElementById("coverInput").click()}
        >
          <img
            src={preview || "https://placehold.co/200x300?text=No+Image"}
            alt="Preview"
            className="w-40 h-56 object-cover rounded"
          />
          <p className="text-gray-400 mt-2 text-sm">
            Chọn ảnh từ máy (sẽ upload khi lưu)
          </p>
          <input
            id="coverInput"
            type="file"
            accept="image/*"
            onChange={handleCoverFileChange}
            className="hidden"
          />
        </div>
        {errors.cover && <p className="text-red-400 text-sm mt-2">{errors.cover}</p>}
      </div>

      {/* Certificate for Seller */}
      {form.uploaderType === "Seller" && (
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-white">
            Giấy chứng nhận bản quyền (tùy chọn)
          </label>
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-6 bg-gray-700 cursor-pointer hover:border-blue-500"
            onClick={() => document.getElementById("certificateInput").click()}
          >
            {certificatePreview ? (
              <img
                src={certificatePreview}
                alt="Certificate Preview"
                className="max-w-full max-h-60 object-contain rounded"
              />
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-2">📄</div>
                <p className="text-gray-400 text-sm">Click để chọn file giấy chứng nhận</p>
                <p className="text-xs text-gray-500 mt-1">(PNG, JPG, PDF)</p>
              </div>
            )}
            <input
              id="certificateInput"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleCertificateFileChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Tải lên giấy chứng nhận bản quyền hoặc giấy phép phân phối hợp pháp
          </p>
        </div>
      )}

      {/* Mô tả */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-white">Mô tả *</label>
        <textarea
          rows={8}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Mô tả nội dung sách..."
          className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Submit & Cancel */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition flex items-center gap-2"
        >
          <RiArrowLeftLine />
          Quay lại
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
              uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white font-medium`}
          >
            {uploading ? (
              <>Đang tạo...</>
            ) : (
              <>
                <RiCheckLine />
                Tạo sách
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen">
      {/* Terms Modal */}
      <BookTermsModal
        show={showTermsModal}
        onAccept={handleAcceptTerms}
        onClose={() => navigate(-1)}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Thêm sách mới</h1>
        <p className="text-gray-400">Tạo sách mới với quy trình 3 bước</p>
      </div>

      {/* Steps */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-green-500">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                <RiCheckLine className="text-green-500 text-5xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Tạo sách thành công!
              </h3>
              <p className="text-gray-400">
                Bạn đã tạo sách thành công. Hãy tiếp tục bằng cách đăng chương để hoàn thiện sách của bạn.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Thêm chương ngay */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/owner/books/${createdBookId}/chapters`, {
                    state: { bookTitle: form.title }
                  });
                }}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <RiArrowRightLine className="text-xl" />
                Thêm chương ngay
              </button>

              {/* Thêm chương sau */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/owner/books");
                }}
                className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
              >
                Thêm chương sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

