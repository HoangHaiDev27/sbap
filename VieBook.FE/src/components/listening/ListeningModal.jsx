import React from "react";
import { RiPlayCircleLine } from "react-icons/ri";

function ListeningModal({ open, item, onClose }) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-black/60 z-50">
      <div className="bg-gray-900 text-white rounded-2xl max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex space-x-6">
          <img
            src={item.image}
            alt={item.title}
            className="w-60 h-60 rounded-lg object-cover"
          />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">00. Lời Giới Thiệu</h2>
            <p>
              <span className="font-medium">Tác giả:</span> {item.author}
            </p>
            <p>
              <span className="font-medium">Thời lượng:</span> {item.duration}
            </p>
            <p>
              <span className="font-medium">Kênh:</span> {item.channel}
            </p>
            <p>
              <span className="font-medium">Người đọc:</span> {item.reader}
            </p>
            <button className="flex items-center space-x-2 mt-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">
              <RiPlayCircleLine className="text-2xl" />
              <span>Nghe ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListeningModal;
