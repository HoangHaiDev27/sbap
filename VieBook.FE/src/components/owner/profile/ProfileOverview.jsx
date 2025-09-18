export default function ProfileOverview() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow">
      <div className="flex items-center space-x-6">
        <img
          src="https://i.pravatar.cc/100"
          alt="Avatar"
          className="w-24 h-24 rounded-full border-2 border-orange-500"
        />
        <div>
          <h2 className="text-xl font-bold">Nguyễn Văn A</h2>
          <p className="text-gray-400">nguyenvana@example.com</p>
          <p className="text-sm text-gray-500">Thành viên từ: 12/03/2023</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Đơn hàng</p>
          <h3 className="text-2xl font-bold text-orange-500">15</h3>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Sản phẩm yêu thích</p>
          <h3 className="text-2xl font-bold text-orange-500">8</h3>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Điểm tích lũy</p>
          <h3 className="text-2xl font-bold text-orange-500">1,250</h3>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Trạng thái</p>
          <h3 className="text-2xl font-bold text-green-400">Hoạt động</h3>
        </div>
      </div>
    </div>
  );
}
