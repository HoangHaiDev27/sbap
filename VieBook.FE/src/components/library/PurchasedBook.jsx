import React, { useState } from "react";

export default function PurchasedBook() {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null); // 🔹 Modal state

  const booksPerPage = 6;

  const purchasedBooks = [
    {
      id: 1,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      cover:
        "https://readdy.ai/api/search-image?query=Rich%20dad%20poor%20dad%20financial%20education%20book%20cover%20design%20with%20money%20coins%20theme%20green%20gold%20colors%20wealth%20clean%20background&width=200&height=280&seq=richdad1&orientation=portrait",
      category: "Tài chính cá nhân",
      price: 159000,
      purchaseDate: "2024-01-20",
      format: "audiobook",
      duration: "6h 45m",
      size: "256 MB",
      rating: 4.8,
      downloads: 1,
      status: "available",
    },
    {
      id: 2,
      title: "The Intelligent Investor",
      author: "Benjamin Graham",
      cover:
        "https://readdy.ai/api/search-image?query=Intelligent%20investor%20stock%20market%20book%20cover%20design%20with%20financial%20charts%20theme%20blue%20white%20colors%20professional%20clean%20background&width=200&height=280&seq=investor1&orientation=portrait",
      category: "Đầu tư",
      price: 199000,
      purchaseDate: "2024-01-18",
      format: "ebook + audiobook",
      duration: "15h 20m",
      size: "1.2 GB",
      rating: 4.9,
      downloads: 3,
      status: "available",
    },
    {
      id: 3,
      title: "Zero to One",
      author: "Peter Thiel",
      cover:
        "https://readdy.ai/api/search-image?query=Zero%20to%20one%20startup%20innovation%20book%20cover%20design%20with%20rocket%20growth%20theme%20blue%20orange%20colors%20modern%20tech%20clean%20background&width=200&height=280&seq=zero1&orientation=portrait",
      category: "Khởi nghiệp",
      price: 129000,
      purchaseDate: "2024-01-15",
      format: "audiobook",
      duration: "4h 55m",
      size: "189 MB",
      rating: 4.6,
      downloads: 2,
      status: "available",
    },
    {
      id: 4,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      cover:
        "https://readdy.ai/api/search-image?query=Psychology%20of%20money%20behavioral%20finance%20book%20cover%20design%20with%20brain%20money%20theme%20purple%20green%20colors%20modern%20clean%20background&width=200&height=280&seq=psychology1&orientation=portrait",
      category: "Tâm lý tài chính",
      price: 179000,
      purchaseDate: "2024-01-12",
      format: "ebook + audiobook",
      duration: "5h 30m",
      size: "450 MB",
      rating: 4.7,
      downloads: 4,
      status: "available",
    },
    {
      id: 5,
      title: "The 4-Hour Workweek",
      author: "Tim Ferriss",
      cover:
        "https://readdy.ai/api/search-image?query=Four%20hour%20workweek%20productivity%20lifestyle%20book%20cover%20design%20with%20clock%20freedom%20theme%20orange%20blue%20colors%20modern%20clean%20background&width=200&height=280&seq=workweek1&orientation=portrait",
      category: "Năng suất",
      price: 149000,
      purchaseDate: "2024-01-10",
      format: "audiobook",
      duration: "13h 2m",
      size: "520 MB",
      rating: 4.5,
      downloads: 1,
      status: "available",
    },
    {
      id: 6,
      title: "Good to Great",
      author: "Jim Collins",
      cover:
        "https://readdy.ai/api/search-image?query=Good%20to%20great%20business%20leadership%20book%20cover%20design%20with%20mountain%20peak%20theme%20blue%20gray%20colors%20professional%20clean%20background&width=200&height=280&seq=great1&orientation=portrait",
      category: "Lãnh đạo",
      price: 189000,
      purchaseDate: "2024-01-08",
      format: "ebook + audiobook",
      duration: "8h 46m",
      size: "680 MB",
      rating: 4.8,
      downloads: 2,
      status: "available",
    },
    {
      id: 7,
      title: "Deep Work",
      author: "Cal Newport",
      cover:
        "https://readdy.ai/api/search-image?query=Deep%20work%20focus%20productivity%20book%20cover%20design%20with%20brain%20light%20theme%20blue%20yellow%20colors%20minimalist%20clean%20background&width=200&height=280&seq=deep1&orientation=portrait",
      category: "Năng suất",
      price: 139000,
      purchaseDate: "2024-01-05",
      format: "audiobook",
      duration: "7h 30m",
      size: "300 MB",
      rating: 4.7,
      downloads: 2,
      status: "available",
    },
  ];

  // Filter + sort
  const getFilteredBooks = () => {
    let filtered = purchasedBooks;

    switch (filter) {
      case "audiobook":
        filtered = purchasedBooks.filter((b) => b.format.includes("audiobook"));
        break;
      case "ebook":
        filtered = purchasedBooks.filter((b) => b.format.includes("ebook"));
        break;
      case "combo":
        filtered = purchasedBooks.filter((b) => b.format.includes("+"));
        break;
      default:
        break;
    }

    switch (sortBy) {
      case "recent":
        return filtered.sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );
      case "oldest":
        return filtered.sort(
          (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)
        );
      case "name":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "price_high":
        return filtered.sort((a, b) => b.price - a.price);
      case "price_low":
        return filtered.sort((a, b) => a.price - b.price);
      default:
        return filtered;
    }
  };

  const getFormatBadge = (format) => {
    if (format.includes("+")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          Combo
        </span>
      );
    } else if (format.includes("audiobook")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Sách nói
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          E-book
        </span>
      );
    }
  };

  // Pagination
  const books = getFilteredBooks();
  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Sách đã mua</h2>
        <div className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 w-full"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="audiobook">Sách nói</option>
            <option value="ebook">E-book</option>
            <option value="combo">Combo</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 w-full"
          >
            <option value="recent">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="name">Tên A-Z</option>
            <option value="price_high">Giá cao → thấp</option>
            <option value="price_low">Giá thấp → cao</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)} // 🔹 Mở modal khi click card
            className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors group cursor-pointer"
          >
            <div className="flex space-x-4">
              <div className="relative">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="ri-download-line text-white text-sm"></i>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{book.author}</p>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                    {book.category}
                  </span>
                  {getFormatBadge(book.format)}
                </div>

                <div className="space-y-1 text-xs text-gray-400 mb-2">
                  <div className="flex justify-between">
                    <span>Giá:</span>
                    <span className="text-green-400 font-semibold">
                      {book.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span>{book.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dung lượng:</span>
                    <span>{book.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    <i className="ri-star-fill text-yellow-400 mr-1"></i>
                    {book.rating}
                  </span>
                  <span>
                    {new Date(book.purchaseDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {paginatedBooks.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-shopping-bag-line text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Chưa có sách nào
          </h3>
          <p className="text-gray-500 mb-4">
            Khám phá và mua sách yêu thích để xây dựng thư viện riêng
          </p>
        </div>
      )}

      {/* 🔹 Modal chi tiết sách */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-full max-w-2xl rounded-lg p-6 relative">
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>

            {/* Nội dung */}
            <div className="flex space-x-6">
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                className="w-36 h-52 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedBook.title}
                </h2>
                <p className="text-gray-400 mb-2">{selectedBook.author}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedBook.category} • {selectedBook.format}
                </p>
                <div className="text-green-400 font-semibold mb-4">
                  {selectedBook.price.toLocaleString("vi-VN")}đ
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium">
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Demo danh sách chương */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Danh sách chương
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Chương 1: Giới thiệu</li>
                <li>Chương 2: Nội dung chính</li>
                <li>Chương 3: Bài học & Kết luận</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
