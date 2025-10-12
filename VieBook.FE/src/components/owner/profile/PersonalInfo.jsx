import { useEffect, useState } from "react";
import { getMe, upsertMyProfile } from "../../../api/userApi";

export default function PersonalInfo() {
  const [form, setForm] = useState({
    FullName: "",
    DateOfBirth: "",
    AvatarUrl: "",
    BankNumber: "",
    BankName: "",
    PortfolioUrl: "",
    Bio: "",
    AgreeTos: true,
  });
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    getMe()
      .then((res) => {
        if (!mounted) return;
        setEmail(res?.email || res?.Email || "");
        const p = res?.profile || {};
        setForm({
          FullName: p.FullName || p.fullName || "",
          DateOfBirth: (p.DateOfBirth || p.dateOfBirth) ? String(p.DateOfBirth || p.dateOfBirth).slice(0, 10) : "",
          AvatarUrl: p.AvatarUrl || p.avatarUrl || "",
          BankNumber: p.BankNumber || p.bankNumber || "",
          BankName: p.BankName || p.bankName || "",
          PortfolioUrl: p.PortfolioUrl || p.portfolioUrl || "",
          Bio: p.Bio || p.bio || "",
          AgreeTos: typeof (p.AgreeTos ?? p.agreeTos) === "boolean" ? (p.AgreeTos ?? p.agreeTos) : true,
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        FullName: form.FullName || null,
        DateOfBirth: form.DateOfBirth ? new Date(form.DateOfBirth).toISOString() : null,
        AvatarUrl: form.AvatarUrl || null,
        BankNumber: form.BankNumber || null,
        BankName: form.BankName || null,
        PortfolioUrl: form.PortfolioUrl || null,
        Bio: form.Bio || null,
        AgreeTos: form.AgreeTos,
      };
      await upsertMyProfile(payload);
      setMsg("Lưu thay đổi thành công");
      try {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Cập nhật hồ sơ thành công" } }));
      } catch { /* noop */ }
    } catch (e) {
      setMsg(e.message || "Lưu thay đổi thất bại");
      try {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: e.message || "Cập nhật hồ sơ thất bại" } }));
      } catch { /* noop */ }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow space-y-6">
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>

      {msg && <div className="text-sm text-gray-200">{msg}</div>}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Họ và tên</label>
          <input
            type="text"
            name="FullName"
            value={form.FullName}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white opacity-70"
          />
        </div>
        {/* Số điện thoại sẽ được cập nhật qua luồng SMS OTP riêng */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ngày sinh</label>
          <input
            type="date"
            name="DateOfBirth"
            value={form.DateOfBirth}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          {/* Ẩn trường AvatarUrl vì đã có mục đổi avatar riêng */}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Số tài khoản</label>
          <input
            type="text"
            name="BankNumber"
            value={form.BankNumber}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ngân hàng</label>
          <input
            type="text"
            name="BankName"
            value={form.BankName}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Portfolio URL</label>
          <input
            type="text"
            name="PortfolioUrl"
            value={form.PortfolioUrl}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Giới thiệu</label>
          <textarea
            name="Bio"
            value={form.Bio}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
            rows={4}
          />
        </div>
        <div className="col-span-2 flex items-center space-x-2">
          <input
            id="agree"
            type="checkbox"
            name="AgreeTos"
            checked={!!form.AgreeTos}
            onChange={onChange}
            className="h-4 w-4"
          />
          <label htmlFor="agree" className="text-sm text-gray-300">Tôi đồng ý với điều khoản</label>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={saving}
        className="px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
