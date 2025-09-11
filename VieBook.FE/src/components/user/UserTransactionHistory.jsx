import React, { useState } from "react";
import {
  RiCloseLine,
  RiBookOpenLine,
  RiWallet3Line,
  RiRefund2Line,
  RiArrowDownCircleLine,
} from "react-icons/ri";

export default function UserTransactionHistory() {
  const [selectedTx, setSelectedTx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const txPerPage = 6;

  const handleCloseModal = () => setSelectedTx(null);

  // ⚡️ Demo data
  const transactions = [
    {
      id: 1,
      type: "purchase",
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      narrator: "Derek Perkins",
      duration: "15h 17m",
      category: "History",
      rating: 4.8,
      reviews: 2847,
      price: 299000,
      oldPrice: 399000,
      cover: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg",
      chapters: [
        { id: 1, name: "Chương 1: Khởi đầu", purchased: true },
        { id: 2, name: "Chương 2: Nông nghiệp", purchased: true },
        { id: 3, name: "Chương 3: Đế chế", purchased: false },
        { id: 4, name: "Chương 4: Cách mạng khoa học", purchased: false },
      ],
      date: "2025-09-01",
    },
    {
      id: 2,
      type: "deposit",
      amount: 500000,
      method: "MoMo",
      status: "success",
      date: "2025-08-30",
    },
    {
      id: 3,
      type: "withdraw",
      amount: 200000,
      method: "Bank ACB",
      status: "success",
      date: "2025-08-28",
    },
    {
      id: 4,
      type: "refund",
      amount: 150000,
      reason: "Hoàn tiền sách lỗi",
      status: "completed",
      date: "2025-08-25",
    },
    {
      id: 5,
      type: "purchase",
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      narrator: "Patrick Egan",
      duration: "20h 2m",
      category: "Psychology",
      rating: 4.6,
      reviews: 1923,
      price: 259000,
      oldPrice: 349000,
      cover: "https://images-na.ssl-images-amazon.com/images/I/71UypkUjStL.jpg",
      chapters: [
        { id: 1, name: "Chương 1: Hai hệ thống tư duy", purchased: true },
        { id: 2, name: "Chương 2: Trực giác", purchased: true },
        { id: 3, name: "Chương 3: Quyết định", purchased: true },
        { id: 4, name: "Chương 4: Sai lệch nhận thức", purchased: false },
      ],
      date: "2025-08-20",
    },
  ];

  // Pagination
  const indexOfLast = currentPage * txPerPage;
  const indexOfFirst = indexOfLast - txPerPage;
  const currentTx = transactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(transactions.length / txPerPage);

  // Icon + label theo loại
  const renderIcon = (type) => {
    switch (type) {
      case "purchase":
        return <RiBookOpenLine className="text-orange-400 text-xl" />;
      case "deposit":
        return <RiWallet3Line className="text-green-400 text-xl" />;
      case "withdraw":
        return <RiArrowDownCircleLine className="text-blue-400 text-xl" />;
      case "refund":
        return <RiRefund2Line className="text-yellow-400 text-xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {currentTx.map((tx) => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition cursor-pointer"
          >
            {renderIcon(tx.type)}
            <div className="flex-1">
              {tx.type === "purchase" ? (
                <div>
                  <p className="text-white font-medium">{tx.title}</p>
                  <p className="text-sm text-gray-400">
                    Mua sách - {tx.price.toLocaleString()}đ
                  </p>
                </div>
              ) : tx.type === "deposit" ? (
                <div>
                  <p className="text-green-400 font-medium">
                    Nạp tiền {tx.amount.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-400">
                    Phương thức: {tx.method}
                  </p>
                </div>
              ) : tx.type === "withdraw" ? (
                <div>
                  <p className="text-blue-400 font-medium">
                    Rút tiền {tx.amount.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-400">
                    Ngân hàng: {tx.method}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-yellow-400 font-medium">
                    Hoàn tiền {tx.amount.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-400">Lý do: {tx.reason}</p>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">{tx.date}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl relative shadow-lg mx-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <RiCloseLine className="text-2xl" />
            </button>

            {selectedTx.type === "purchase" ? (
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={selectedTx.cover}
                  alt={selectedTx.title}
                  className="w-40 h-60 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedTx.title}
                  </h3>
                  <p className="text-gray-300">Tác giả: {selectedTx.author}</p>
                  <p className="text-gray-300">
                    Narrator: {selectedTx.narrator}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Thể loại: {selectedTx.category}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Thời lượng: {selectedTx.duration}
                  </p>
                  <div className="flex items-center gap-2 text-yellow-400 mt-2">
                    <i className="ri-star-fill"></i>
                    <span>{selectedTx.rating}</span>
                    <span className="text-gray-400">
                      ({selectedTx.reviews} reviews)
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-orange-400 font-bold text-lg mr-2">
                      {selectedTx.price.toLocaleString()}đ
                    </span>
                    {selectedTx.oldPrice && (
                      <span className="line-through text-gray-500">
                        {selectedTx.oldPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Chi tiết giao dịch
                </h3>
                {selectedTx.type === "deposit" && (
                  <p className="text-gray-300">
                    Bạn đã nạp{" "}
                    <span className="text-green-400">
                      {selectedTx.amount.toLocaleString()}đ
                    </span>{" "}
                    qua {selectedTx.method}.
                  </p>
                )}
                {selectedTx.type === "withdraw" && (
                  <p className="text-gray-300">
                    Bạn đã rút{" "}
                    <span className="text-blue-400">
                      {selectedTx.amount.toLocaleString()}đ
                    </span>{" "}
                    về {selectedTx.method}.
                  </p>
                )}
                {selectedTx.type === "refund" && (
                  <p className="text-gray-300">
                    Bạn đã được hoàn{" "}
                    <span className="text-yellow-400">
                      {selectedTx.amount.toLocaleString()}đ
                    </span>{" "}
                    ({selectedTx.reason}).
                  </p>
                )}
              </div>
            )}

            {/* Nếu có chapters */}
            {selectedTx.type === "purchase" &&
              selectedTx.chapters?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Danh sách chương
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedTx.chapters.map((ch) => (
                      <div
                        key={ch.id}
                        className={`p-3 rounded-lg text-sm text-center ${
                          ch.purchased
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {ch.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
