import { RiAddLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookFilters from "../../components/owner/book/BookFilters";
import BookTable from "../../components/owner/book/BookTable";
import { getUserId } from "../../api/authApi";

import { getBooksByOwner, getCategories } from "../../api/ownerBookApi";


export default function OwnerBooks() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");
  const [sort, setSort] = useState("newest");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooksAndCategories = async () => {
    try {
      setLoading(true);
      const ownerId = getUserId();
      if (!ownerId) {
        setBooks([]);
        setCategories([]);
        return;
      }

      const [booksData, categoriesData] = await Promise.all([
        getBooksByOwner(ownerId),
        getCategories(),
      ]);

      setBooks(Array.isArray(booksData) ? booksData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Lỗi khi load dữ liệu:", err);
      setBooks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /// Filtering + Sorting
  const filteredBooks = books
    .filter((b) => {
      const matchSearch =
        !search ||
        (b.title && b.title.toLowerCase().includes(search.toLowerCase())) ||
        (b.author && b.author.toLowerCase().includes(search.toLowerCase()));

      const matchCategory =
        category === "Tất cả" ||
        !category ||
        (b.categoryIds && b.categoryIds.includes(Number(category)));

      const matchStatus = status === "Tất cả" || !status || b.status === status;

      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sort === "bestseller") {
        return (b.sold || 0) - (a.sold || 0);
      }
      return 0;
    });


  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Sách</h1>
          <p className="text-gray-400">Quản lý toàn bộ sách của bạn</p>
        </div>

        <Link
          to="/owner/books/new"
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <RiAddLine className="mr-2" /> Thêm sách mới
        </Link>
      </div>

      {/* Filters */}
      <BookFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
      />

      {/* Table */}
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
        {loading ? (
          <p className="text-gray-400">Đang tải sách...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Bạn chưa có sách nào.</p>
        ) : (
          <BookTable
            books={filteredBooks}
            categories={categories}
            onBookDeleted={fetchBooksAndCategories}
          />
        )}
      </div>
    </div>
  );
}
