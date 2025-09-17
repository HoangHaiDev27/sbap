export default function AccountSecurity() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow space-y-6">
      <h2 className="text-xl font-bold mb-4">Bảo mật tài khoản</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mật khẩu hiện tại</label>
        <input
          type="password"
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mật khẩu mới</label>
        <input
          type="password"
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
        <input
          type="password"
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
      </div>

      <button className="px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600">
        Đổi mật khẩu
      </button>

      <div className="pt-6 border-t border-gray-700">
        <h3 className="font-semibold mb-2">Xác thực hai yếu tố (2FA)</h3>
        <p className="text-gray-400 text-sm mb-3">
          Bảo vệ tài khoản tốt hơn bằng cách bật 2FA.
        </p>
        <button className="px-4 py-2 bg-slate-700 rounded-lg font-medium hover:bg-slate-600">
          Bật 2FA
        </button>
      </div>
    </div>
  );
}
