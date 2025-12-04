import React from "react";
import {
  RiEyeLine,
  RiCalendarLine,
  RiGlobalLine,
  RiBarcodeLine,
  RiBookmarkLine,
} from "react-icons/ri";

export default function DetailsTab({ bookDetail }) {
  const { isbn, language, totalView, createdAt, categories } = bookDetail;

  const detailItems = [
    {
      icon: RiBarcodeLine,
      label: "ISBN",
      value: isbn || "Chưa có",
      color: "text-blue-400"
    },
    {
      icon: RiGlobalLine,
      label: "Ngôn ngữ",
      value: language || "Tiếng việt",
      color: "text-green-400"
    },
    {
      icon: RiEyeLine,
      label: "Lượt xem",
      value: totalView?.toLocaleString() || "0",
      color: "text-purple-400"
    },
    {
      icon: RiCalendarLine,
      label: "Ngày tạo",
      value: createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : "Chưa có",
      color: "text-orange-400"
    },
    {
      icon: RiBookmarkLine,
      label: "Thể loại",
      value: categories?.length > 0 ? categories.join(", ") : "Chưa phân loại",
      color: "text-pink-400"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detailItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${item.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-white text-sm break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
