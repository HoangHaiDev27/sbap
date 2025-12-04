import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BookOverview from "../../components/owner/bookDetail/BookOverview";
import BookContent from "../../components/owner/bookDetail/BookContent";
import BookReviews from "../../components/owner/bookDetail/BookReviews";
import BookInfoCard from "../../components/owner/bookDetail/BookInfoCard";
import BookStatsCard from "../../components/owner/bookDetail/BookStatsCard";
import { getOwnerBookDetail } from "../../api/bookApi";
import { getUserId } from "../../api/authApi";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setError(null);

    // Validate id is a number
    if (!id || Number.isNaN(Number(id))) {
      setError("ID sách không hợp lệ.");
      setLoading(false);
      return;
    }

    // Get current user ID
    const currentUserId = getUserId();
    if (!currentUserId) {
      setError("Vui lòng đăng nhập để truy cập trang này.");
      setLoading(false);
      return;
    }

    // Check book existence and verify ownership
    getOwnerBookDetail(Number(id))
      .then((book) => {
        if (!mounted) return;
        
        // Check if current user is the owner of this book
        const bookOwnerId = book.ownerId || book.OwnerId;
        if (bookOwnerId !== Number(currentUserId)) {
          setError("Bạn không có quyền truy cập sách này. Chỉ chủ sở hữu mới có thể xem chi tiết.");
          // Optionally redirect after a delay
          setTimeout(() => {
            if (mounted) {
              navigate("/owner/books");
            }
          }, 7000);
          return;
        }

        // Book belongs to current user, allow access
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        if (e.message.includes("Không tìm thấy")) {
          setError("Không tìm thấy sách hoặc đã bị xóa.");
        } else if (e.message.includes("quyền truy cập")) {
          setError("Bạn không có quyền truy cập sách này.");
        } else {
          setError(e.message || "Không thể kết nối máy chủ.");
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="bg-slate-800 p-4 rounded-lg">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Không thể truy cập</h2>
          <p className="text-red-300 mb-4">{error}</p>
          {error.includes("quyền truy cập") && (
            <p className="text-sm text-gray-400 mb-4">
              Bạn sẽ được chuyển về trang danh sách sách trong giây lát...
            </p>
          )}
          <button
            onClick={() => navigate("/owner/books")}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Quay về danh sách sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Bên trái */}
      <div className="xl:col-span-1 space-y-6">
        <BookInfoCard bookId={id} />
      </div>

      {/* Bên phải */}
      <div className="xl:col-span-3 space-y-6">
        {/* Stats */}
        <BookStatsCard />

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-700">
          {["overview", "content", "reviews"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 border-b-2 transition ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "Tổng quan"}
              {tab === "content" && "Nội dung"}
              {tab === "reviews" && "Đánh giá"}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "overview" && <BookOverview bookId={id} />}
          {activeTab === "content" && <BookContent bookId={id} />}
          {activeTab === "reviews" && <BookReviews bookId={id} />}
        </div>
      </div>
    </div>
  );
}
