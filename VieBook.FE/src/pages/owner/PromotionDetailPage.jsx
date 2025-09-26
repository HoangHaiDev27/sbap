import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPromotionDetail } from "../../api/promotionApi";

export default function PromotionDetailPage() {
  const { promotionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPromotionDetail(promotionId);
        setData(res);
      } catch (e) {
        setError(e.message || "Lỗi tải chi tiết promotion");
      } finally {
        setLoading(false);
      }
    })();
  }, [promotionId]);

  if (loading) return <div className="p-6 text-white">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!data) return null;

  const status = (() => {
    const now = new Date();
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    if (now < start) return { label: "Sắp diễn ra", className: "bg-yellow-600" };
    if (now > end) return { label: "Kết thúc", className: "bg-gray-500" };
    return data.isActive ? { label: "Đang hoạt động", className: "bg-green-600" } : { label: "Không hoạt động", className: "bg-red-600" };
  })();

  return (
    <div className="p-6 space-y-6 text-white">
      <button className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => navigate(-1)}>Quay lại</button>
      <div className="bg-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{data.promotionName}</h1>
          <span className={`${status.className} text-white px-2 py-1 rounded-lg text-xs`}>{status.label}</span>
        </div>
        <p className="opacity-80 mt-2">{data.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-700 p-4 rounded-xl">
            <p className="text-xs opacity-70">Loại & Giá trị</p>
            <p className="text-lg font-semibold text-orange-400">{data.discountValue}%</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-xl">
            <p className="text-xs opacity-70">Thời gian</p>
            <p className="text-lg font-semibold">{new Date(data.startAt).toLocaleString("vi-VN")} - {new Date(data.endAt).toLocaleString("vi-VN")}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-xl">
            <p className="text-xs opacity-70">Số sách áp dụng</p>
            <p className="text-lg font-semibold">{data.books?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">Sách áp dụng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.books?.map((b) => (
            <div key={b.bookId} className="bg-slate-700 p-4 rounded-xl flex gap-3 items-center">
              <img src={b.coverUrl} alt={b.title} className="w-12 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs opacity-70">Giá gốc: {b.totalPrice?.toLocaleString()} đ</p>
                <p className="text-xs opacity-70">Giá sau giảm: {b.discountedPrice?.toLocaleString()} đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


