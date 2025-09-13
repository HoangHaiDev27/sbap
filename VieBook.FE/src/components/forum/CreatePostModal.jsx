import React, { useState } from "react";
import {
  RiCloseLine,
  RiMessage3Line,
  RiGiftLine,
  RiBookLine,
  RiImageLine,
} from "react-icons/ri";

export default function CreatePostModal({ onClose }) {
  const [postType, setPostType] = useState("discuss");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageFile: null,
    tags: "",
    bookTitle: "",
    bookCover: null,
    quantity: "",
    deadline: ""
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting post:", { postType, ...formData });
    onClose();
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
            {formData.imageFile && (
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

          {/* Book Information (only for giveaway) */}
          {postType === "giveaway" && (
            <div className="bg-slate-750 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <RiBookLine size={16} />
                Thông tin tặng sách
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tên sách *
                  </label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) =>
                      handleInputChange("bookTitle", e.target.value)
                    }
                    placeholder="Nhập tên sách..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Ảnh bìa sách
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:border-orange-500 hover:text-white cursor-pointer">
                    <RiImageLine size={18} />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange("bookCover", e.target.files[0])
                      }
                    />
                  </label>
                  {formData.bookCover && (
                    <p className="text-xs text-slate-400 mt-2">
                      Đã chọn: {formData.bookCover.name}
                    </p>
                  )}
                </div>

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
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Đăng bài
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
