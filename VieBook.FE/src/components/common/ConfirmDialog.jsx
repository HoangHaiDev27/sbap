import React from "react";
import { RiCloseLine, RiErrorWarningLine } from "react-icons/ri";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "warning" // warning, danger, info
}) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case "danger":
        return {
          icon: <RiErrorWarningLine className="text-red-500" size={24} />,
          confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
          iconBg: "bg-red-100"
        };
      case "info":
        return {
          icon: <RiErrorWarningLine className="text-blue-500" size={24} />,
          confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          iconBg: "bg-blue-100"
        };
      default: // warning
        return {
          icon: <RiErrorWarningLine className="text-yellow-500" size={24} />,
          confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          iconBg: "bg-yellow-100"
        };
    }
  };

  const { icon, confirmButtonClass, iconBg } = getIconAndColors();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconBg}`}>
              {icon}
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
