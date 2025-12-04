import { useMemo, useState } from "react";
import { changePassword } from "../../../api/authApi";

export default function AccountSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ current: "", next: "", confirm: "" });

  const computeErrors = (cp, np, cf) => {
    const nextErrors = { current: "", next: "", confirm: "" };
    if (!cp) nextErrors.current = "Vui lòng nhập mật khẩu hiện tại";
    if (!np) nextErrors.next = "Vui lòng nhập mật khẩu mới";
    if (!cf) nextErrors.confirm = "Vui lòng xác nhận mật khẩu mới";
    if (np) {
      if (np.length < 8) nextErrors.next = "Mật khẩu tối thiểu 8 ký tự";
      if (!/[A-Z]/.test(np)) nextErrors.next = nextErrors.next || "Phải có ít nhất 1 chữ hoa";
      if (!/[a-z]/.test(np)) nextErrors.next = nextErrors.next || "Phải có ít nhất 1 chữ thường";
      if (!/\d/.test(np)) nextErrors.next = nextErrors.next || "Phải có ít nhất 1 chữ số";
      if (!/[^A-Za-z0-9]/.test(np)) nextErrors.next = nextErrors.next || "Phải có ít nhất 1 ký tự đặc biệt";
    }
    if (cp && np && cp === np) nextErrors.next = "Mật khẩu mới không được trùng mật khẩu hiện tại";
    if (np && cf && np !== cf) nextErrors.confirm = "Xác nhận mật khẩu không khớp";
    return nextErrors;
  };

  const validateAndSet = (cp, np, cf) => {
    const errs = computeErrors(cp, np, cf);
    setErrors(errs);
    return !errs.current && !errs.next && !errs.confirm;
  };

  const isValid = useMemo(() => {
    const errs = computeErrors(currentPassword, newPassword, confirmPassword);
    return !errs.current && !errs.next && !errs.confirm;
  }, [currentPassword, newPassword, confirmPassword]);

  const onSubmit = async () => {
    if (!validateAndSet(currentPassword, newPassword, confirmPassword)) {
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Vui lòng kiểm tra lại các trường" } }));
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({ current: "", next: "", confirm: "" });
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Đổi mật khẩu thành công" } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: e.message || "Đổi mật khẩu thất bại" } }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow space-y-6">
      <h2 className="text-xl font-bold mb-4">Bảo mật tài khoản</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mật khẩu hiện tại</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => { const v = e.target.value; setCurrentPassword(v); validateAndSet(v, newPassword, confirmPassword); }}
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
        {errors.current && <div className="text-sm text-red-400 mt-1">{errors.current}</div>}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => { const v = e.target.value; setNewPassword(v); validateAndSet(currentPassword, v, confirmPassword); }}
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
        {errors.next && <div className="text-sm text-red-400 mt-1">{errors.next}</div>}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => { const v = e.target.value; setConfirmPassword(v); validateAndSet(currentPassword, newPassword, v); }}
          placeholder="********"
          className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
        />
        {errors.confirm && <div className="text-sm text-red-400 mt-1">{errors.confirm}</div>}
      </div>

      <button onClick={onSubmit} disabled={saving || !isValid} className="px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60">
        {saving ? "Đang đổi..." : "Đổi mật khẩu"}
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
