import React, { useState } from "react";
import { Link } from "react-router-dom";

const authors = [
  {
    id: "1",
    name: "Nguyễn Nhật Ánh",
    image:
      "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/8768/webp_8aeb57752de319cd.webp",
    description:
      "Nhà văn Nguyễn Nhật Ánh sinh ngày 7 tháng 5 năm 1955 tại tỉnh Quảng Nam...",
    booksCount: 15,
  },
  {
    id: "2",
    name: "Nguyên Phong",
    image:
      "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/321/webp_9fae3eb3f8d30c61f2863b72f13a0ff2f314c092.webp",
    description:
      "Dịch giả Nguyên Phong tên thật là Vũ Văn Du, sinh năm 1950 tại Hà Nội...",
    booksCount: 12,
  },
  {
    id: "3",
    name: "Robin Sharma",
    image:
      "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/327/webp_f3eb65bf2576c41f5dadd9c8d75bae4ed3f6a2c0.webp",
    description:
      "Robin Sharma là một trong những nhà cố vấn được tin cậy nhất thế giới...",
    booksCount: 8,
  },
  {
    id: "4",
    name: "Ajahn Brahm",
    image:
      "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/331/webp_86cc024d7e3938ea95722b52bb57dd8c229699b3.webp",
    description:
      "Ajahn Brahm là cao tăng thuộc dòng tu Thượng tọa bộ người Anh gốc Úc...",
    booksCount: 6,
  },
];

export default function AuthorSection() {
  const [current, setCurrent] = useState(0);
  const visibleItems = 2; // hiển thị 2 card 1 lúc
  const total = authors.length;

  const next = () => {
    if (current < total - visibleItems) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Tác giả nổi bật</h2>

      <div className="relative">
        {/* Nút Prev */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-full z-10"
        >
          ‹
        </button>

        {/* Slider container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * (100 / visibleItems)}%)` }}
          >
            {authors.map((author) => (
              <Link
                key={author.id}
                to={`/authors/${author.id}`}
                className="w-1/2 flex-shrink-0 px-3" // 1/2 vì visibleItems = 2
              >
               <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors h-48 flex flex-col">
                <div className="flex items-start space-x-4 flex-1 overflow-hidden">
                  <img
                    src={author.image}
                    alt={author.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors mb-2 truncate">
                      {author.name}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed mb-3">
                      {author.description}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-blue-400">
                  {author.booksCount} tác phẩm
                </div>
              </div>

              </Link>
            ))}
          </div>
        </div>

        {/* Nút Next */}
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-full z-10"
        >
          ›
        </button>
      </div>
    </div>
  );
}
