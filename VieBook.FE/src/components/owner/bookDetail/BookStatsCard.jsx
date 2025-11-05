import { RiShoppingCartLine, RiMoneyDollarCircleLine, RiStarLine, RiEyeLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBookStats } from "../../../api/bookApi";

export default function BookStatsCard({ bookId: propBookId }) {
  const { id: routeId } = useParams();
  const bookId = propBookId ?? routeId;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    if (!bookId || Number.isNaN(Number(bookId))) {
      setError("ID sách không hợp lệ.");
      setLoading(false);
      return;
    }

    getBookStats(Number(bookId))
      .then((data) => {
        if (!mounted) return;
        setStats(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Không lấy được thống kê");
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [bookId]);

  if (loading) return <div className="bg-slate-800 p-4 rounded-lg">Đang tải...</div>;
  if (error || !stats) return <div className="bg-slate-800 p-4 rounded-lg text-red-400">{error || "Không có dữ liệu"}</div>;

  const cards = [
    { icon: RiShoppingCartLine, label: "Lượt mua", value: (stats.purchases ?? 0).toLocaleString() },
    { icon: RiMoneyDollarCircleLine, label: "Doanh thu", value: `${Number(stats.revenue ?? 0).toLocaleString()} Xu` },
    { icon: RiStarLine, label: "Đánh giá TB", value: `${Number(stats.averageRating ?? 0).toFixed(1)}/5` },
    { icon: RiEyeLine, label: "Lượt đọc", value: (stats.totalReads ?? 0).toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <div key={i} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
          <stat.icon className="text-2xl text-gray-300" />
        </div>
      ))}
    </div>
  );
}
