export default function NotificationSettings() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow space-y-6">
      <h2 className="text-xl font-bold mb-4">Cài đặt thông báo</h2>

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input type="checkbox" defaultChecked className="w-5 h-5" />
          <span>Email khi có đơn hàng mới</span>
        </label>
        <label className="flex items-center space-x-3">
          <input type="checkbox" className="w-5 h-5" />
          <span>Email khuyến mãi & ưu đãi</span>
        </label>
        <label className="flex items-center space-x-3">
          <input type="checkbox" defaultChecked className="w-5 h-5" />
          <span>Thông báo trên ứng dụng</span>
        </label>
        <label className="flex items-center space-x-3">
          <input type="checkbox" className="w-5 h-5" />
          <span>Tin nhắn SMS</span>
        </label>
      </div>

      <button className="px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600">
        Lưu cài đặt
      </button>
    </div>
  );
}
