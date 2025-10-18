import React, { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiBookOpenLine,
  RiWallet3Line,
  RiRefund2Line,
  RiArrowDownCircleLine,
} from "react-icons/ri";
import { getUserTransactionHistory } from "../../api/transactionApi";

export default function UserTransactionHistory() {
  const [selectedTx, setSelectedTx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const txPerPage = 6;

  const handleCloseModal = () => setSelectedTx(null);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transactionsData = await getUserTransactionHistory();
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };



  // Pagination
  const indexOfLast = currentPage * txPerPage;
  const indexOfFirst = indexOfLast - txPerPage;
  const currentTx = transactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(transactions.length / txPerPage);

  // Build page numbers with ellipsis for large page counts
  const buildPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const add = (p) => pages.push(p);
    add(1);
    if (currentPage > 4) add("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) add(p);
    if (currentPage < totalPages - 3) add("...");
    add(totalPages);
    return pages;
  };

  // Icon + label theo loại
  const renderIcon = (transaction) => {
    if (transaction.type === "purchase") {
      return <RiBookOpenLine className="text-orange-400 text-xl" />;
    } else if (transaction.type === "wallet") {
      switch (transaction.transactionType) {
        case "deposit":
          return <RiWallet3Line className="text-green-400 text-xl" />;
        case "withdraw":
          return <RiArrowDownCircleLine className="text-blue-400 text-xl" />;
        case "refund":
          return <RiRefund2Line className="text-yellow-400 text-xl" />;
        default:
          return <RiWallet3Line className="text-gray-400 text-xl" />;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Chưa có giao dịch nào</p>
        </div>
      )}

      {/* List */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {currentTx.map((tx, index) => (
            <div
              key={tx.id || `tx-${index}`}
              onClick={() => setSelectedTx(tx)}
              className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition cursor-pointer"
            >
              {renderIcon(tx)}
              <div className="flex-1">
                {tx.type === "purchase" ? (
                  <div>
                    <p className="text-white font-medium">{tx.bookTitle}</p>
                    <p className="text-sm text-gray-400">
                      {tx.description} - {tx.amount.toLocaleString()}đ
                    </p>
                  </div>
                ) : tx.type === "wallet" ? (
                  <div>
                    <p className={`font-medium ${
                      tx.transactionType === "deposit" ? "text-green-400" :
                      tx.transactionType === "withdraw" ? "text-blue-400" :
                      tx.transactionType === "refund" ? "text-yellow-400" :
                      "text-white"
                    }`}>
                      {tx.description} {tx.amount.toLocaleString()}đ
                    </p>
                    <p className="text-sm text-gray-400">
                      Trạng thái: {tx.status}
                    </p>
                  </div>
                ) : null}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(tx.date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          {buildPageNumbers().map((page, idx) => (
            typeof page === "number" ? (
              <button
                key={`p-${page}`}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded ${
                  currentPage === page
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={`e-${idx}`} className="px-2 text-gray-400">{page}</span>
            )
          ))}
          <button
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}

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
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Chi tiết mua chương
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Tên sách</p>
                    <p className="text-white font-medium">{selectedTx.bookTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tác giả</p>
                    <p className="text-white">{selectedTx.bookAuthor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Chương</p>
                    <p className="text-white">{selectedTx.chapterTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Số tiền</p>
                    <p className="text-orange-400 font-bold text-lg">
                      {selectedTx.amount.toLocaleString()}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Ngày mua</p>
                    <p className="text-white">
                      {new Date(selectedTx.date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Chi tiết giao dịch ví
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Loại giao dịch</p>
                    <p className="text-white font-medium">{selectedTx.transactionType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mô tả</p>
                    <p className="text-white">{selectedTx.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Số tiền</p>
                    <p className={`font-bold text-lg ${
                      selectedTx.transactionType === "deposit" ? "text-green-400" :
                      selectedTx.transactionType === "withdraw" ? "text-blue-400" :
                      selectedTx.transactionType === "refund" ? "text-yellow-400" :
                      "text-white"
                    }`}>
                      {selectedTx.amount.toLocaleString()}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Trạng thái</p>
                    <p className="text-white">{selectedTx.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Ngày giao dịch</p>
                    <p className="text-white">
                      {new Date(selectedTx.date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
