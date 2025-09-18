export default function PersonalInfo() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow space-y-6">
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Họ và tên</label>
          <input
            type="text"
            defaultValue="Nguyễn Văn A"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            defaultValue="nguyenvana@example.com"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
          <input
            type="text"
            defaultValue="0901234567"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ngày sinh</label>
          <input
            type="date"
            defaultValue="1998-08-12"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
      </div>

      <button className="px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600">
        Lưu thay đổi
      </button>
    </div>
  );
}
