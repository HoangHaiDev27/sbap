import { useEffect, useState } from "react";
import { getOwnerBookDetail } from "../../../api/bookApi";

export default function BookInfoCard({ bookId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getOwnerBookDetail(Number(bookId))
      .then((data) => {
        if (!mounted) return;
        setBook(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Failed to load book");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [bookId]);

  if (loading) {
    return <div className="bg-slate-800 p-4 rounded-lg text-center shadow">Đang tải...</div>;
  }

  if (error || !book) {
    return <div className="bg-slate-800 p-4 rounded-lg text-center shadow text-red-400">{error || "Không tìm thấy sách"}</div>;
  }

  const categories = book.categories || [];
  const ratingCount = Array.isArray(book.reviews) ? book.reviews.length : 0;
  const avgRating = ratingCount > 0 ? (book.reviews.reduce((s, r) => s + (r.rating || 0), 0) / ratingCount).toFixed(1) : "-";

  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center shadow">
      <img src={book.coverUrl} alt={book.title} className="mx-auto rounded shadow mb-4" />
      <h2 className="text-lg font-bold">{book.title}</h2>
      <p className="text-sm text-gray-400 mb-2">Tác giả: {book.author || "—"}</p>

      <div className="flex justify-center gap-2 mb-3">
        {categories.map((tag, i) => (
          <span key={i} className={`text-xs px-2 py-1 rounded ${i === 0 ? "bg-blue-600" : "bg-green-600"}`}>
            {tag}
          </span>
        ))}
      </div>

      {book.hasPromotion && book.discountedPrice != null ? (
        <div className="mb-2">
          <p className="text-orange-400 font-bold text-xl">{Number(book.discountedPrice).toLocaleString()} Xu</p>
          {book.totalPrice != null && (
            <p className="text-xs line-through text-gray-400">{Number(book.totalPrice).toLocaleString()} Xu</p>
          )}
        </div>
      ) : (
        book.totalPrice != null && <p className="text-orange-400 font-bold text-xl mb-2">{Number(book.totalPrice).toLocaleString()} Xu</p>
      )}

      <p className="text-yellow-400 text-sm mb-1">⭐ {avgRating} ({ratingCount} đánh giá)</p>

      <p className="text-sm mb-1">
        Trạng thái: <span className="text-green-400 font-semibold">{book.status}</span>
      </p>
      {book.createdAt && (
        <p className="text-xs text-gray-400">Ngày tạo: {new Date(book.createdAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}
