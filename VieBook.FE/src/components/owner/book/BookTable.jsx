import { useState } from "react";
import { Link } from "react-router-dom";
import {
  RiStarFill,
  RiBookOpenLine,
  RiEyeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSoundModuleLine,
} from "react-icons/ri";
import { getCategories } from "../../../api/ownerBookApi";
import { deleteBook } from "../../../api/ownerBookApi";


// biến books url
const BOOK_API_URL = getCategories();

const ITEMS_PER_PAGE = 5;

// Hàm tạo danh sách số trang thông minh với dấu "..."
function getPaginationRange(currentPage, totalPages, delta = 1) {
  const range = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);

  if (left > 2) range.push("...");

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) range.push("...");

  if (totalPages > 1) range.push(totalPages);

  return range;
}

export default function BookTable({ books, categories, onBookDeleted }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null); // sách đang chọn để xóa
  const [loadingDelete, setLoadingDelete] = useState(false);

  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);

  const paginatedBooks = books.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 🔗 Helper: render categories dạng badge
  const getCategoryTags = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0)
      return <span className="text-gray-400">Chưa có thể loại</span>;

    return (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {categoryIds.map((id) => {
          const category = categories.find((c) => c.categoryId === id);
          if (!category) return null;
          return (
            <span
              key={id}
              className="px-2 py-0.5 text-xs rounded bg-slate-700 text-gray-200 border border-gray-600"
            >
              {category.name}
            </span>
          );
        })}
      </div>
    );
  };

  // Helper: đổi status
  const getStatusBadge = (status) => {
    let colorClass = "bg-gray-600";
    let text = status;

    if (status === "Approved") {
      colorClass = "bg-green-600";
      text = "Đang bán";
    } else if (status === "Active") {
      colorClass = "bg-yellow-600";
      text = "Chờ duyệt";
    } else if (status === "InActive") {
      colorClass = "bg-red-600";
      text = "Tạm dừng";
    }

    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${colorClass}`}>
        {text}
      </span>
    );
  };

  // Hàm xóa sách (DELETE -> theo id)
  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    try {
      setLoadingDelete(true);

      await deleteBook(selectedBook.bookId);

      if (onBookDeleted) {
        onBookDeleted(selectedBook.bookId);
      }

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "success", message: `Đã xóa sách "${selectedBook.title}" thành công!` }
      }));

      setSelectedBook(null);
    } catch (err) {
      console.error(err);

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "error", message: err.message || "Có lỗi khi xóa sách!" }
      }));
    } finally {
      setLoadingDelete(false);
    }
  };



  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-700 text-gray-300">
            <th className="p-3">Sách</th>
            <th className="p-3">Thể loại</th>
            <th className="p-3">Giá</th>
            <th className="p-3">Đã bán</th>
            <th className="p-3">Đánh giá</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBooks.map((book) => (
            <tr
              key={book.bookId}
              className="border-b border-gray-700 hover:bg-gray-800"
            >
              <td className="p-3 flex items-center space-x-3">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-xs text-gray-400">{book.author}</p>
                </div>
              </td>
              <td className="p-3">{getCategoryTags(book.categoryIds)}</td>
              <td className="p-3">{book.totalPrice || 0}</td>
              <td className="p-3">{book.sold || 0}</td>
              <td className="p-3 align-middle text-yellow-400">
                <div className="flex items-center">
                  <RiStarFill className="mr-1" /> {book.rating || 0}
                </div>
              </td>
              <td className="p-3">{getStatusBadge(book.status)}</td>
              <td className="p-3 align-middle">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/owner/books/${book.bookId}`}
                    className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition"
                    title="Xem"
                  >
                    <RiEyeLine className="text-white text-lg" />
                  </Link>

                  <Link
                    to={`/owner/books/${book.bookId}/edit`}
                    className="p-2 bg-green-500 rounded hover:bg-green-600 transition"
                    title="Sửa"
                  >
                    <RiEdit2Line className="text-white text-lg" />
                  </Link>

                  <Link
                    to={`/owner/books/${book.bookId}/chapters`}
                    className="p-2 bg-indigo-500 rounded hover:bg-indigo-600 transition"
                    title="Quản lý chương"
                  >
                    <RiBookOpenLine className="text-white text-lg" />
                  </Link>
                  <Link
                    to={`/owner/books/${book.bookId}/audio`}
                    className="p-2 bg-purple-500 rounded hover:bg-purple-600 transition"
                    title="Audio"
                  >
                    <RiSoundModuleLine className="text-white text-lg" />
                  </Link>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 transition"
                    title="Xóa"
                    onClick={() => setSelectedBook(book)}
                  >
                    <RiDeleteBinLine className="text-white text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Nút Trước */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm ${currentPage === 1
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Trước
          </button>

          {/* Các số trang */}
          {getPaginationRange(currentPage, totalPages).map((page, index) =>
            page === "..." ? (
              <span
                key={`dots-${index}`}
                className="px-3 py-1 text-sm text-gray-400 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${currentPage === page
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {page}
              </button>
            )
          )}

          {/* Nút Sau */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm ${currentPage === totalPages
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Sau
          </button>
        </div>
      )}

      {/* Popup xác nhận xóa */}
      {selectedBook && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-white mb-4">
              Xác nhận xóa
            </h2>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa sách{" "}
              <span className="font-bold text-orange-400">
                {selectedBook.title}
              </span>{" "}
              không?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteBook}
                disabled={loadingDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loadingDelete ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
