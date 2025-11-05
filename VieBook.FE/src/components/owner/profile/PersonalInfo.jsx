import { useEffect, useState } from "react";
import { getMe, upsertMyProfile } from "../../../api/userApi";
import { getSupportedBanks } from "../../../api/vietQrApi";

export default function PersonalInfo() {
  const [form, setForm] = useState({
    FullName: "",
    DateOfBirth: "",
    AvatarUrl: "",
    BankNumber: "",
    BankName: "",
    PortfolioUrl: "",
    Bio: "",
    Address: "",
  });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Load banks
    const loadBanks = async () => {
      try {
        setLoadingBanks(true);
        const bankList = await getSupportedBanks();
        if (mounted) {
          setBanks(bankList);
        }
      } catch (err) {
        console.error("Error loading banks:", err);
      } finally {
        if (mounted) {
          setLoadingBanks(false);
        }
      }
    };
    
    loadBanks();
    
    // Load user profile
    getMe()
      .then((res) => {
        if (!mounted) return;
        setEmail(res?.email || res?.Email || "");
        const p = res?.profile || {};
        setPhone(p.PhoneNumber || p.phoneNumber || "");
        setForm({
          FullName: p.FullName || p.fullName || "",
          DateOfBirth: (p.DateOfBirth || p.dateOfBirth) ? String(p.DateOfBirth || p.dateOfBirth).slice(0, 10) : "",
          AvatarUrl: p.AvatarUrl || p.avatarUrl || "",
          BankNumber: p.BankNumber || p.bankNumber || "",
          BankName: p.BankName || p.bankName || "",
          PortfolioUrl: p.PortfolioUrl || p.portfolioUrl || "",
          Bio: p.Bio || p.bio || "",
          Address: p.Address || p.address || "",
        });
        console.log("PersonalInfo - Profile data loaded:", p); // Debug log
        console.log("PersonalInfo - Address value:", p.Address || p.address || ""); // Debug log
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
    
    // Validate date of birth - không cho phép chọn ngày sinh ở tương lai
    if (form.DateOfBirth) {
      const selectedDate = new Date(form.DateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (selectedDate > today) {
        setMsg("Không thể chọn ngày sinh ở tương lai");
        setSaving(false);
        return;
      }
    }
    
    try {
      const payload = {
        FullName: form.FullName || null,
        DateOfBirth: form.DateOfBirth ? new Date(form.DateOfBirth).toISOString() : null,
        AvatarUrl: form.AvatarUrl || null,
        BankNumber: form.BankNumber || null,
        BankName: form.BankName || null,
        PortfolioUrl: form.PortfolioUrl || null,
        Bio: form.Bio || null,
        Address: form.Address || null,
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
        <div>
          <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
          <input
            type="tel"
            value={phone || "Chưa cập nhật"}
            readOnly
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ngày sinh</label>
          <input
            type="date"
            name="DateOfBirth"
            value={form.DateOfBirth}
            onChange={onChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ngân hàng</label>
          {loadingBanks ? (
            <div className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-gray-400">
              Đang tải danh sách ngân hàng...
            </div>
          ) : (
            <select
              name="BankName"
              value={form.BankName}
              onChange={onChange}
              className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
            >
              <option value="">-- Chọn ngân hàng --</option>
              {banks.map((bank) => (
                <option key={bank.acqId} value={bank.name}>
                  {bank.name} {bank.shortName ? `(${bank.shortName})` : ""}
                </option>
              ))}
            </select>
          )}
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
        <div className="col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Địa chỉ</label>
          {console.log("PersonalInfo - Address field value:", form.Address)}
          <textarea
            name="Address"
            value={form.Address}
            onChange={onChange}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-gray-600 text-white"
            rows={3}
            placeholder="Nhập địa chỉ của bạn"
          />
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
