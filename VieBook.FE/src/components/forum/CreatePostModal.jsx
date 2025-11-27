import React, { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiMessage3Line,
  RiGiftLine,
  RiBookLine,
  RiImageLine,
  RiBookOpenLine,
  RiPlayCircleLine,
  RiCheckLine,
  RiSearchLine,
} from "react-icons/ri";
import { getBooksByOwner, getChapterAudios } from "../../api/ownerBookApi";
import { getBookDetail } from "../../api/bookApi";
import { getChapterAudioPrices } from "../../api/ownerBookApi";
import { createPost } from "../../api/postApi";
import { uploadPostImage } from "../../api/uploadApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { isBookOwner } from "../../api/authApi";
import toast from "react-hot-toast";

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { userId } = useCurrentUser();
  const [postType, setPostType] = useState("discuss");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageFile: null,
    imagePreview: null,
    tags: "",
    bookId: null,
    bookTitle: "",
    bookCover: null,
    chapterId: null,
    audioId: null,
    accessType: "Both", // Soft/Audio/Both
    quantity: "",
    deadline: ""
  });
  const [books, setBooks] = useState([]);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chapterAudios, setChapterAudios] = useState([]);
  const [audioPrices, setAudioPrices] = useState({});
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingAudios, setLoadingAudios] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    if (field === "imageFile" && file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: file
      }));
    }
  };

  // Load owner's books
  useEffect(() => {
    if (postType === "giveaway" && userId) {
      loadBooks();
    } else {
      setBookSearchQuery("");
      setShowBookDropdown(false);
    }
  }, [postType, userId]);

  // Update search query when book is selected externally
  useEffect(() => {
    if (formData.bookId) {
      const book = books.find(b => b.bookId === formData.bookId);
      if (book) {
        setBookSearchQuery(book.title || "");
      }
    } else {
      setBookSearchQuery("");
    }
  }, [formData.bookId, books]);

  // Load chapters when book is selected
  useEffect(() => {
    if (postType === "giveaway" && formData.bookId) {
      loadChapters(formData.bookId);
    } else {
      setChapters([]);
      setFormData(prev => ({ ...prev, chapterId: null, audioId: null, accessType: "Both" }));
    }
  }, [formData.bookId, postType]);

  // Load audios when chapter is selected (luôn load để kiểm tra có audio không)
  useEffect(() => {
    if (postType === "giveaway" && formData.chapterId) {
      loadChapterAudios(formData.chapterId);
    } else {
      setChapterAudios([]);
      setFormData(prev => ({ ...prev, audioId: null }));
    }
  }, [formData.chapterId, postType]);

  // Tự động set accessType mặc định dựa trên dữ liệu có sẵn
  useEffect(() => {
    if (postType === "giveaway" && formData.chapterId && !loadingAudios) {
      const hasAudios = chapterAudios.length > 0;
      
      // Nếu accessType là Audio hoặc Both nhưng không có audio, chuyển về Soft
      if ((formData.accessType === "Audio" || formData.accessType === "Both") && !hasAudios) {
        setFormData(prev => ({ ...prev, accessType: "Soft", audioId: null }));
      }
    }
  }, [chapterAudios.length, formData.chapterId, postType, formData.accessType, loadingAudios]);

  const loadBooks = async () => {
    if (!userId) return;
    
    try {
      setLoadingBooks(true);
      const response = await getBooksByOwner(userId);
      // Handle different response formats
      if (Array.isArray(response)) {
        setBooks(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setBooks(response.data);
      } else {
        console.warn("Unexpected response format:", response);
        setBooks([]);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      toast.error("Không thể tải danh sách sách");
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadChapters = async (bookId) => {
    try {
      setLoadingChapters(true);
      const [bookDetail, audioPricesData] = await Promise.all([
        getBookDetail(bookId),
        getChapterAudioPrices(bookId)
      ]);

      if (bookDetail?.chapters) {
        // Filter active chapters
        const activeChapters = bookDetail.chapters.filter(c => c.status === "Active");
        setChapters(activeChapters);
      }

      if (audioPricesData && typeof audioPricesData === 'object') {
        setAudioPrices(audioPricesData);
      }
    } catch (error) {
      console.error("Failed to load chapters:", error);
      toast.error("Không thể tải danh sách chương");
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleBookSelect = (bookId) => {
    const selectedBook = books.find(b => b.bookId === bookId);
    setFormData(prev => ({
      ...prev,
      bookId: bookId,
      bookTitle: selectedBook?.title || "",
      chapterId: null
    }));
    setBookSearchQuery(selectedBook?.title || "");
    setShowBookDropdown(false);
  };

  const filteredBooks = books.filter((book) => {
    if (!bookSearchQuery.trim()) return true;
    const query = bookSearchQuery.toLowerCase().trim();
    return (
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query)
    );
  });

  const selectedBook = books.find(b => b.bookId === formData.bookId);

  const handleChapterSelect = (chapterId) => {
    setFormData(prev => ({
      ...prev,
      chapterId: chapterId,
      audioId: null // Reset audio when chapter changes
    }));
  };

  const loadChapterAudios = async (chapterId) => {
    try {
      setLoadingAudios(true);
      const response = await getChapterAudios(chapterId);
      // Handle different response formats
      if (Array.isArray(response)) {
        setChapterAudios(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setChapterAudios(response.data);
      } else {
        console.warn("Unexpected response format for audios:", response);
        setChapterAudios([]);
      }
    } catch (error) {
      console.error("Failed to load chapter audios:", error);
      toast.error("Không thể tải danh sách audio");
      setChapterAudios([]);
    } finally {
      setLoadingAudios(false);
    }
  };

  const handleAccessTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      accessType: type,
      // Reset audioId nếu chọn Soft (chỉ bản đọc)
      audioId: type === "Soft" ? null : prev.audioId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }
    
    if (postType === "giveaway") {
      if (!formData.bookId) {
        toast.error("Vui lòng chọn sách");
        return;
      }
      if (!formData.chapterId) {
        toast.error("Vui lòng chọn chương");
        return;
      }
      // Chỉ yêu cầu audioId nếu accessType là Audio hoặc Both
      if ((formData.accessType === "Audio" || formData.accessType === "Both") && !formData.audioId) {
        toast.error("Vui lòng chọn bản audio");
        return;
      }
      if (!formData.quantity || parseInt(formData.quantity) < 1) {
        toast.error("Vui lòng nhập số suất tặng hợp lệ");
        return;
      }
      if (!formData.deadline) {
        toast.error("Vui lòng chọn hạn đăng ký");
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload ảnh trước nếu có
      let imageUrl = null;
      if (formData.imageFile) {
        try {
          toast.loading("Đang tải ảnh lên...", { id: "upload-image" });
          const uploadResult = await uploadPostImage(formData.imageFile);
          imageUrl = uploadResult.imageUrl || uploadResult.url;
          toast.success("Tải ảnh thành công!", { id: "upload-image" });
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error(error.message || "Không thể tải ảnh lên. Vui lòng thử lại.", { id: "upload-image" });
          return; // Dừng lại nếu upload ảnh thất bại
        }
      }
      
      // Determine visibility: Pending for discuss posts from non-owners, Public for owners or giveaway posts
      const isOwner = isBookOwner();
      const visibility = (postType === "discuss" && !isOwner) ? "Pending" : "Public";
      
      const postPayload = {
        content: formData.content,
        postType: postType === "giveaway" ? "giveaway" : "discuss",
        visibility: visibility,
        title: formData.title,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : []
      };
      
      // Thêm imageUrl vào payload (backend có thể dùng để tạo attachment)
      if (imageUrl) {
        postPayload.imageUrl = imageUrl;
      }
      
      // If it's a giveaway, include book offer data
      if (postType === "giveaway") {
        postPayload.bookOffer = {
          bookId: formData.bookId,
          chapterId: formData.chapterId,
          audioId: formData.audioId || null,
          accessType: formData.accessType,
          quantity: parseInt(formData.quantity),
          endAt: new Date(formData.deadline).toISOString(),
          criteria: null
        };
      }
      
      const response = await createPost(postPayload);
      if (visibility === "Pending") {
        toast.success("Bài đăng của bạn đã được gửi và đang chờ duyệt!");
      } else {
        toast.success("Đăng bài thành công!");
      }
      onClose();
      // Reload danh sách bài viết sau khi đăng bài
      if (onPostCreated) {
        onPostCreated();
      } else {
        // Fallback: reload trang nếu không có callback
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(error.message || "Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Đăng bài mới</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Post Type */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-sm font-medium text-white mb-3">Loại bài đăng *</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setPostType("discuss")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                postType === "discuss"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500"
              }`}
            >
              <RiMessage3Line size={18} />
              Thảo luận
            </button>
            {isBookOwner() && (
              <button
                onClick={() => setPostType("giveaway")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  postType === "giveaway"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500"
                }`}
              >
                <RiGiftLine size={18} />
                Tặng sách
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nội dung *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Ảnh minh họa
            </label>
            <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:border-orange-500 hover:text-white cursor-pointer">
              <RiImageLine size={18} />
              <span>Tải ảnh lên</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileChange("imageFile", e.target.files[0])
                }
              />
            </label>
            {formData.imagePreview && (
              <div className="mt-4">
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-64 rounded-lg border border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null }))}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Xóa ảnh
                </button>
              </div>
            )}
            {formData.imageFile && !formData.imagePreview && (
              <p className="text-xs text-slate-400 mt-2">
                Đã chọn: {formData.imageFile.name}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="tâm lý, kỹ năng, kinh doanh..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Book Information (only for giveaway, and only for book owners) */}
          {postType === "giveaway" && isBookOwner() && (
            <div className="bg-slate-750 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <RiBookLine size={16} />
                Thông tin tặng sách
              </h4>

              <div className="space-y-4">
                {/* Book Selection - Combined Search and Select */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Chọn sách *
                  </label>
                  {loadingBooks ? (
                    <div className="text-slate-400 text-sm">Đang tải...</div>
                  ) : (
                    <div className="relative">
                      {/* Search Input */}
                      <div className="relative">
                        <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={bookSearchQuery}
                          onChange={(e) => {
                            setBookSearchQuery(e.target.value);
                            setShowBookDropdown(true);
                            if (!e.target.value.trim()) {
                              setFormData(prev => ({ ...prev, bookId: null, bookTitle: "", chapterId: null }));
                            }
                          }}
                          onFocus={() => setShowBookDropdown(true)}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => setShowBookDropdown(false), 200);
                          }}
                          placeholder={selectedBook ? selectedBook.title : "Tìm kiếm và chọn sách..."}
                          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                          required={!formData.bookId}
                        />
                      </div>
                      {/* Dropdown List */}
                      {showBookDropdown && filteredBooks.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredBooks.map((book) => (
                            <div
                              key={book.bookId}
                              onClick={() => handleBookSelect(book.bookId)}
                              className={`px-4 py-3 cursor-pointer hover:bg-slate-600 transition-colors ${
                                formData.bookId === book.bookId ? "bg-slate-600" : ""
                              }`}
                            >
                              <div className="text-white font-medium">{book.title}</div>
                              {book.author && (
                                <div className="text-slate-400 text-sm">{book.author}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* No results message */}
                      {showBookDropdown && bookSearchQuery.trim() && filteredBooks.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-4">
                          <div className="text-slate-400 text-sm text-center">
                            Không tìm thấy sách nào
                          </div>
                        </div>
                      )}
                      {/* Selected book display (when not focused) */}
                      {formData.bookId && selectedBook && !showBookDropdown && (
                        <div className="mt-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
                          <div className="text-white text-sm font-medium">{selectedBook.title}</div>
                          {selectedBook.author && (
                            <div className="text-slate-400 text-xs">{selectedBook.author}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chapter Selection */}
                {formData.bookId && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Chọn chương *
                    </label>
                    {loadingChapters ? (
                      <div className="text-slate-400 text-sm">Đang tải...</div>
                    ) : chapters.length === 0 ? (
                      <div className="text-slate-400 text-sm">Không có chương nào</div>
                    ) : (
                      <select
                        value={formData.chapterId || ""}
                        onChange={(e) => handleChapterSelect(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required
                      >
                        <option value="">-- Chọn chương --</option>
                        {chapters.map((chapter, index) => (
                          <option key={chapter.chapterId} value={chapter.chapterId}>
                            Chương {index + 1}: {chapter.chapterTitle || "Chưa có tiêu đề"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Access Type Selection - chỉ hiển thị nút nếu có dữ liệu tương ứng */}
                {formData.chapterId && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Loại bản tặng *
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {/* Luôn hiển thị nút Bản đọc vì đã chọn chapter (chương luôn có bản đọc) */}
                      <button
                        type="button"
                        onClick={() => handleAccessTypeChange("Soft")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          formData.accessType === "Soft"
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <RiBookOpenLine size={18} />
                        Bản đọc
                      </button>
                      {/* Chỉ hiển thị nút Bản nghe nếu có audio cho chapter này */}
                      {chapterAudios.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAccessTypeChange("Audio")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                              formData.accessType === "Audio"
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            <RiPlayCircleLine size={18} />
                            Bản nghe
                          </button>
                          {/* Chỉ hiển thị nút Cả hai nếu có audio */}
                          <button
                            type="button"
                            onClick={() => handleAccessTypeChange("Both")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                              formData.accessType === "Both"
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            <RiCheckLine size={18} />
                            Cả hai
                          </button>
                        </>
                      )}
                    </div>
                    {/* Thông báo nếu đang tải audio */}
                    {loadingAudios && (
                      <p className="text-sm text-slate-400 mt-2">
                        Đang kiểm tra bản nghe...
                      </p>
                    )}
                  </div>
                )}

                {/* Audio Selection (only for Audio or Both, và chỉ hiển thị nếu có audio) */}
                {formData.chapterId && (formData.accessType === "Audio" || formData.accessType === "Both") && chapterAudios.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Chọn bản audio *
                    </label>
                    {loadingAudios ? (
                      <div className="text-slate-400 text-sm">Đang tải...</div>
                    ) : (
                      <select
                        value={formData.audioId || ""}
                        onChange={(e) => handleInputChange("audioId", e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        required={formData.accessType === "Audio" || formData.accessType === "Both"}
                      >
                        <option value="">-- Chọn audio --</option>
                        {chapterAudios.map((audio) => (
                          <option key={audio.audioId} value={audio.audioId}>
                            {audio.voiceName || `Audio ${audio.audioId}`} {audio.durationSec ? `(${Math.floor(audio.durationSec / 60)}:${String(audio.durationSec % 60).padStart(2, '0')})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                {/* Thông báo nếu chọn Audio/Both nhưng không có audio */}
                {formData.chapterId && (formData.accessType === "Audio" || formData.accessType === "Both") && !loadingAudios && chapterAudios.length === 0 && (
                  <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                    Chương này không có bản audio. Vui lòng chọn "Bản đọc" hoặc chọn chương khác.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Số suất tặng *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      placeholder="5"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Hạn đăng ký *
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        handleInputChange("deadline", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
