import { RiStarFill } from "react-icons/ri";

export default function ReviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">847</p>
        <p className="text-sm text-gray-400">Tổng đánh giá</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold flex items-center gap-1">
          4.6 <RiStarFill className="text-yellow-400" />
        </p>
        <p className="text-sm text-gray-400">Điểm TB</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">12</p>
        <p className="text-sm text-gray-400">Chưa phản hồi</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-xl font-bold">68%</p>
        <p className="text-sm text-gray-400">Đánh giá 5 sao</p>
      </div>
    </div>
  );
}
