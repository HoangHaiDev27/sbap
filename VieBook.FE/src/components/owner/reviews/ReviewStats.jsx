import { RiStarFill } from "react-icons/ri";

export default function ReviewStats({ stats = null, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xl font-bold">0</p>
          <p className="text-sm text-gray-400">Tổng đánh giá</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xl font-bold flex items-center gap-1">
            0 <RiStarFill className="text-yellow-400" />
          </p>
          <p className="text-sm text-gray-400">Điểm TB</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xl font-bold">0</p>
          <p className="text-sm text-gray-400">Chưa phản hồi</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xl font-bold">0%</p>
          <p className="text-sm text-gray-400">Đánh giá 5 sao</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">{stats.totalReviews}</p>
        <p className="text-sm text-gray-400">Tổng đánh giá</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold flex items-center gap-1">
          {stats.averageRating} <RiStarFill className="text-yellow-400" />
        </p>
        <p className="text-sm text-gray-400">Điểm TB</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">{stats.unRepliedCount}</p>
        <p className="text-sm text-gray-400">Chưa phản hồi</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">{stats.fiveStarPercentage}%</p>
        <p className="text-sm text-gray-400">Đánh giá 5 sao</p>
      </div>
    </div>
  );
}
