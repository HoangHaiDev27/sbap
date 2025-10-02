import React, { useEffect, useMemo, useRef, useState } from "react";
import { upsertMyProfile, becomeOwner } from "../../api/userApi";
import { sendOtpToPhone } from "../../lib/phoneAuth";

export default function OwnerApplicationStepper({ initialProfile, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [form, setForm] = useState({
    fullName: initialProfile?.fullName || "",
    phoneNumber: initialProfile?.phoneNumber || "",
    dateOfBirth: initialProfile?.dateOfBirth || "",
    bankNumber: initialProfile?.bankNumber || "",
    bankName: initialProfile?.bankName || "",
    portfolioUrl: "",
    bio: "",
    agreeTos: false,
    otp: ""
  });

  const recaptchaId = useMemo(() => `recaptcha-container-${Math.random().toString(36).slice(2)}`, []);

  const steps = [
    { id: 1, title: "Thông tin cơ bản" },
    { id: 2, title: "Xác thực số điện thoại" },
    { id: 3, title: "Tài khoản ngân hàng" },
    { id: 4, title: "Hồ sơ & Cam kết" },
    { id: 5, title: "Hoàn tất" }
  ];

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.fullName?.trim()) return "Vui lòng nhập họ tên";
      if (!form.phoneNumber?.trim()) return "Vui lòng nhập số điện thoại";
      return null;
    }
    if (step === 2) {
      if (!form.otp && !confirmationResult) return "Vui lòng gửi OTP trước";
      return null;
    }
    if (step === 3) {
      if (!form.bankNumber?.trim()) return "Vui lòng nhập số tài khoản";
      if (!form.bankName?.trim()) return "Vui lòng nhập tên ngân hàng";
      return null;
    }
    if (step === 4) {
      if (!form.agreeTos) return "Bạn cần đồng ý điều khoản";
      return null;
    }
    return null;
  };

  const next = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (step === 2 && confirmationResult && form.otp) {
      try {
        setLoading(true);
        await confirmationResult.confirm(form.otp);
      } catch (e) {
        setError("OTP không hợp lệ. Vui lòng thử lại");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setStep(s => Math.min(s + 1, steps.length));
  };

  const back = () => setStep(s => Math.max(1, s - 1));

  const sendOtp = async () => {
    setError("");
    try {
      if (!form.phoneNumber) {
        setError("Vui lòng nhập số điện thoại");
        return;
      }
      setLoading(true);
      const phone = normalizeToE164(form.phoneNumber);
      const res = await sendOtpToPhone(phone, recaptchaId);
      setConfirmationResult(res);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Đã gửi OTP đến số điện thoại" } }));
    } catch (e) {
      setError(e?.message || "Không gửi được OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitAll = async () => {
    setError("");
    try {
      setLoading(true);
      // Upsert profile first
      const payload = {
        fullName: form.fullName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        bankNumber: form.bankNumber || undefined,
        bankName: form.bankName || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        bio: form.bio || undefined,
        agreeTos: !!form.agreeTos,
      };
      if (form.dateOfBirth) payload.dateOfBirth = new Date(form.dateOfBirth);
      await upsertMyProfile(payload);
      // Then call become owner (server will enforce requirements)
      const res = await becomeOwner();
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: res?.message || "Đăng ký chủ sách thành công" } }));
      setStep(5);
      onSuccess && onSuccess();
    } catch (e) {
      setError(e?.message || "Không thể hoàn tất đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Đăng ký trở thành chủ sách</h3>
        <button onClick={onClose} className="text-gray-300 hover:text-white"><i className="ri-close-line text-xl"></i></button>
      </div>

      <StepperHeader steps={steps} current={step} />

      {!!error && (
        <div className="mt-3 p-3 rounded bg-red-500/20 border border-red-500/40 text-red-200 text-sm">{error}</div>
      )}

      <div className="mt-4">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Họ và tên">
              <input value={form.fullName} onChange={e=>setField('fullName', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
            <Field label="Số điện thoại">
              <input value={form.phoneNumber} onChange={e=>setField('phoneNumber', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
            <Field label="Ngày sinh">
              <input type="date" value={form.dateOfBirth} onChange={e=>setField('dateOfBirth', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <div id={recaptchaId} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Field label="Số điện thoại (E.164 nếu quốc tế)">
                  <input value={form.phoneNumber} onChange={e=>setField('phoneNumber', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
                </Field>
              </div>
              <div className="flex items-end">
                <button onClick={sendOtp} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Gửi OTP</button>
              </div>
            </div>
            {confirmationResult && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Field label="Nhập OTP">
                    <input value={form.otp} onChange={e=>setField('otp', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
                  </Field>
                </div>
                <div className="flex items-end">
                  <button onClick={next} disabled={loading || !form.otp} className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Xác nhận OTP</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Số tài khoản">
              <input value={form.bankNumber} onChange={e=>setField('bankNumber', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
            <Field label="Tên ngân hàng">
              <input value={form.bankName} onChange={e=>setField('bankName', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Portfolio (tuỳ chọn)">
              <input value={form.portfolioUrl} onChange={e=>setField('portfolioUrl', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" placeholder="Link tác phẩm, mạng xã hội, Google Drive..." />
            </Field>
            <Field label="Giới thiệu bản thân (tuỳ chọn)">
              <textarea value={form.bio} onChange={e=>setField('bio', e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.agreeTos} onChange={e=>setField('agreeTos', e.target.checked)} />
              Tôi cam kết tuân thủ quy định và điều khoản của VieBook.
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-6">
            <i className="ri-checkbox-circle-line text-5xl text-green-500"></i>
            <p className="mt-2 text-lg">Bạn đã đăng ký chủ sách thành công!</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={back} disabled={step===1 || step===5} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">Quay lại</button>
        {step < 4 && <button onClick={next} disabled={step===2 && !confirmationResult} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">Tiếp tục</button>}
        {step === 4 && <button onClick={submitAll} disabled={loading || !form.agreeTos} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Gửi đăng ký</button>}
        {step === 5 && <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Đóng</button>}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function StepperHeader({ steps, current }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, idx) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? 'bg-green-600' : active ? 'bg-orange-500' : 'bg-gray-600'}`}>{s.id}</div>
            <span className={`text-sm ${active ? 'text-white' : 'text-gray-300'}`}>{s.title}</span>
            {idx < steps.length - 1 && <div className="w-8 h-[2px] bg-gray-600 mx-2" />}
          </div>
        );
      })}
    </div>
  );
}

function normalizeToE164(phone) {
  const trimmed = String(phone).trim();
  if (trimmed.startsWith('+')) return trimmed;
  // Assume Vietnam if not provided: prepend +84 and strip leading 0
  const noSpaces = trimmed.replace(/\s+/g, '');
  if (noSpaces.startsWith('0')) return `+84${noSpaces.slice(1)}`;
  return `+84${noSpaces}`;
}


