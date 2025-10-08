import { useEffect, useState } from "react";
import { getMe, uploadAvatar, deleteImageByUrl, upsertMyProfile } from "../../../api/userApi";

export default function ProfileOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarTs, setAvatarTs] = useState(0);

  useEffect(() => {
    let mounted = true;
    getMe()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e) => mounted && setError(e.message || "Lỗi tải hồ sơ"));
    return () => {
      mounted = false;
    };
  }, []);

  const p = data?.profile || {};
  const avatarRaw = p.AvatarUrl || p.avatarUrl || "https://i.pravatar.cc/100";
  const avatar = avatarRaw + (avatarRaw.includes("?") ? `&t=${avatarTs}` : `?t=${avatarTs}`);
  const fullName = p.FullName || p.fullName || "Chưa cập nhật";
  const email = data?.email || data?.Email || "";
  const phone = p.PhoneNumber || p.phoneNumber || "";
  const bankNumber = p.BankNumber || p.bankNumber || "";
  const bankName = p.BankName || p.bankName || "";
  const portfolio = p.PortfolioUrl || p.portfolioUrl || "";
  const bio = p.Bio || p.bio || "";
  const createdAt = data?.createdAt || data?.CreatedAt
    ? new Date(data.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow">
      {error && (
        <div className="mb-4 text-sm text-red-400">{error}</div>
      )}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-2 border-orange-500"
          />
          <label className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded cursor-pointer">
            {uploading ? "..." : "Đổi ảnh"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const oldUrl = data?.profile?.AvatarUrl;
                  const newUrl = await uploadAvatar(file);
                  // Update profile AvatarUrl
                  await upsertMyProfile({ AvatarUrl: newUrl });
                  // Best-effort delete old image after successful update
                  if (oldUrl && oldUrl !== newUrl) {
                    try { await deleteImageByUrl(oldUrl); } catch { /* ignore */ }
                  }
                  // refresh me
                  const refreshed = await getMe();
                  setData(refreshed);
                  setAvatarTs(Date.now());
                  try {
                    window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Cập nhật ảnh đại diện thành công" } }));
                  } catch {}
                } catch (e) {
                  setError(e.message || "Upload ảnh thất bại");
                  try {
                    window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: e.message || "Upload ảnh thất bại" } }));
                  } catch {}
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-gray-400">{email}</p>
          {createdAt && (
            <p className="text-sm text-gray-500">Thành viên từ: {createdAt}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Số dư ví</p>
          <h3 className="text-2xl font-bold text-orange-500">{data?.wallet ?? 0}</h3>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Quyền</p>
          <h3 className="text-2xl font-bold text-orange-500">{(data?.roles || []).join(", ")}</h3>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-400">Email</p>
          <h3 className="text-md font-semibold text-gray-200">{email}</h3>
        </div>
        {phone && (
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Số điện thoại</p>
            <h3 className="text-md font-semibold text-gray-200">{phone}</h3>
          </div>
        )}
        {(bankNumber || bankName) && (
          <div className="bg-slate-700 p-4 rounded-lg md:col-span-2">
            <p className="text-gray-400">Ngân hàng</p>
            <h3 className="text-md font-semibold text-gray-200">{bankName} {bankNumber && `- ${bankNumber}`}</h3>
          </div>
        )}
        {portfolio && (
          <div className="bg-slate-700 p-4 rounded-lg md:col-span-2">
            <p className="text-gray-400">Portfolio</p>
            <a href={portfolio} className="text-orange-400 underline break-all" target="_blank" rel="noreferrer">{portfolio}</a>
          </div>
        )}
        {bio && (
          <div className="bg-slate-700 p-4 rounded-lg md:col-span-2">
            <p className="text-gray-400">Giới thiệu</p>
            <p className="text-gray-200 whitespace-pre-wrap">{bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
