import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { upsertMyProfile, becomeOwner } from "../../api/userApi";
import { sendOtpToPhone } from "../../lib/phoneAuth";
import { getSupportedBanks } from "../../api/vietQrApi";
import { logout } from "../../api/authApi";

export default function OwnerApplicationStepper({ initialProfile, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false); // Track if user tried to submit

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

  // Load banks when step 3 is reached
  useEffect(() => {
    if (step === 3 && banks.length === 0) {
      const loadBanks = async () => {
        try {
          setLoadingBanks(true);
          const bankList = await getSupportedBanks();
          setBanks(bankList);
          // Auto-select bank if form.bankName matches a bank in the list
          if (form.bankName && bankList.length > 0) {
            const matchedBank = bankList.find(
              (bank) => bank.name?.toLowerCase() === form.bankName?.toLowerCase() ||
                        bank.shortName?.toLowerCase() === form.bankName?.toLowerCase()
            );
            if (matchedBank) {
              setForm(prev => ({ ...prev, bankName: matchedBank.name || matchedBank.shortName || prev.bankName }));
            }
          }
        } catch (err) {
          console.error("Error loading banks:", err);
        } finally {
          setLoadingBanks(false);
        }
      };
      loadBanks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const steps = [
    { id: 1, title: "Thông tin cơ bản" },
    { id: 2, title: "Xác thực số điện thoại" },
    { id: 3, title: "Tài khoản ngân hàng" },
    { id: 4, title: "Hồ sơ & Cam kết" },
    { id: 5, title: "Hoàn tất" }
  ];

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  // Validation helpers
  const validatePhoneNumber = (phone) => {
    if (!phone?.trim()) return "Vui lòng nhập số điện thoại";
    const cleaned = phone.replace(/\s+/g, '');
    // Cho phép: số bắt đầu bằng 0, +84, hoặc 84
    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(cleaned)) {
      return "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số)";
    }
    return null;
  };

  const validateDateOfBirth = (dateStr) => {
    if (!dateStr) return null; // Tùy chọn
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) return "Ngày sinh không hợp lệ";
    if (date > today) return "Ngày sinh không thể trong tương lai";
    
    // Tính tuổi chính xác
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    if (age < 16) return "Bạn phải đủ 16 tuổi để đăng ký";
    if (age > 100) return "Ngày sinh không hợp lệ";
    
    return null;
  };

  const validateBankNumber = (bankNumber) => {
    if (!bankNumber?.trim()) return "Vui lòng nhập số tài khoản";
    const cleaned = bankNumber.replace(/\s+/g, '');
    // Số tài khoản thường là số, độ dài từ 8-19 số
    if (!/^[0-9]{8,19}$/.test(cleaned)) {
      return "Số tài khoản không hợp lệ. Vui lòng nhập số tài khoản (8-19 chữ số)";
    }
    return null;
  };

  const validateUrl = (url) => {
    if (!url?.trim()) return null; // Tùy chọn
    try {
      new URL(url);
      return null;
    } catch {
      return "URL không hợp lệ. Vui lòng nhập đầy đủ URL (ví dụ: https://example.com)";
    }
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      // Validate họ tên
      if (!form.fullName?.trim()) return "Vui lòng nhập họ tên";
      if (form.fullName.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
      if (form.fullName.trim().length > 150) return "Họ tên không được vượt quá 150 ký tự";
      
      // Validate số điện thoại
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) return phoneError;
      
      // Validate ngày sinh (tùy chọn nhưng nếu có thì phải hợp lệ)
      const dobError = validateDateOfBirth(form.dateOfBirth);
      if (dobError) return dobError;
      
      return null;
    }
    if (step === 2) {
      if (!form.phoneNumber?.trim()) {
        const phoneError = validatePhoneNumber(form.phoneNumber);
        if (phoneError) return phoneError;
      }
      if (!confirmationResult) return "Vui lòng gửi OTP trước";
      if (!form.otp?.trim()) return "Vui lòng nhập mã OTP";
      if (!/^[0-9]{6}$/.test(form.otp.trim())) {
        return "Mã OTP phải là 6 chữ số";
      }
      return null;
    }
    if (step === 3) {
      // Validate số tài khoản
      const bankNumberError = validateBankNumber(form.bankNumber);
      if (bankNumberError) return bankNumberError;
      
      // Validate tên ngân hàng
      if (!form.bankName?.trim()) return "Vui lòng chọn ngân hàng";
      return null;
    }
    if (step === 4) {
      // Validate Portfolio URL nếu có
      if (form.portfolioUrl?.trim()) {
        const urlError = validateUrl(form.portfolioUrl);
        if (urlError) return urlError;
      }
      
      // Validate Bio độ dài nếu có
      if (form.bio?.trim() && form.bio.trim().length > 1000) {
        return "Giới thiệu bản thân không được vượt quá 1000 ký tự";
      }
      
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
    setTriedSubmit(false); // Reset when moving to next step
    setStep(s => Math.min(s + 1, steps.length));
  };

  const back = () => {
    setTriedSubmit(false); // Reset when going back
    setError(""); // Clear error when going back
    setStep(s => Math.max(1, s - 1));
  };

  const sendOtp = async () => {
    setError("");
    try {
      // Validate số điện thoại trước khi gửi
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) {
        setError(phoneError);
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
    setTriedSubmit(true); // Mark that user tried to submit
    
    // Validate step 4 first
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    
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
      
      // Hiển thị thông báo thành công
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { 
          type: "success", 
          message: "Đăng ký chủ sách thành công! Vui lòng đăng nhập lại để sử dụng quyền mới." 
        } 
      }));
      
      setStep(5);
      setTriedSubmit(false); // Reset on success
      
      // Đợi 2 giây để user đọc thông báo, sau đó logout và redirect về login
      setTimeout(async () => {
        try {
          await logout();
          navigate("/auth");
        } catch (err) {
          console.error("Error during logout:", err);
          // Vẫn redirect dù logout có lỗi
          navigate("/auth");
        }
      }, 5000);
      
      onSuccess && onSuccess();
    } catch (e) {
      setError(e?.message || "Không thể hoàn tất đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 md:p-6 w-full max-w-2xl text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold pr-2">Đăng ký trở thành chủ sách</h3>
        <button onClick={onClose} className="text-gray-300 hover:text-white flex-shrink-0"><i className="ri-close-line text-xl"></i></button>
      </div>

      <StepperHeader steps={steps} current={step} />

      {!!error && (
        <div className="mt-3 p-3 rounded bg-red-500/20 border border-red-500/40 text-red-200 text-xs md:text-sm break-words">{error}</div>
      )}

      <div className="mt-4">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Họ và tên *">
              <input 
                value={form.fullName} 
                onChange={e=>setField('fullName', e.target.value)} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                placeholder="Nhập họ và tên đầy đủ"
                maxLength={150}
                required
              />
            </Field>
            <Field label="Số điện thoại *">
              <input 
                type="tel"
                value={form.phoneNumber} 
                onChange={e=>setField('phoneNumber', e.target.value)} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                placeholder="0xxx xxx xxx hoặc +84xxx xxx xxx"
                maxLength={15}
                required
              />
            </Field>
            <Field label="Ngày sinh (tùy chọn)">
              <input 
                type="date" 
                value={form.dateOfBirth} 
                onChange={e=>setField('dateOfBirth', e.target.value)} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
                max={new Date().toISOString().split('T')[0]}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <div id={recaptchaId} className="mb-3" />
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
              <div className="md:col-span-2">
                <Field label="Số điện thoại (E.164 nếu quốc tế) *">
                  <input 
                    type="tel"
                    value={form.phoneNumber} 
                    onChange={e=>setField('phoneNumber', e.target.value)} 
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                    placeholder="0xxx xxx xxx hoặc +84xxx xxx xxx"
                    maxLength={15}
                    required
                  />
                </Field>
              </div>
              <div className="flex items-end md:items-end">
                <button 
                  onClick={sendOtp} 
                  disabled={loading || !form.phoneNumber?.trim()} 
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gửi OTP
                </button>
              </div>
            </div>
            {confirmationResult && (
              <div className="mt-3 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
                <div className="md:col-span-2">
                  <Field label="Nhập OTP *">
                    <input 
                      type="text"
                      value={form.otp} 
                      onChange={e=>{
                        const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
                        setField('otp', value.slice(0, 6)); // Giới hạn 6 số
                      }} 
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white text-center md:text-left text-lg md:text-base tracking-widest md:tracking-normal" 
                      placeholder="Nhập 6 chữ số"
                      maxLength={6}
                      required
                    />
                  </Field>
                </div>
                <div className="flex items-end md:items-end">
                  <button 
                    onClick={next} 
                    disabled={loading || !form.otp || form.otp.length !== 6} 
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác nhận OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Số tài khoản *">
              <input 
                type="text"
                value={form.bankNumber} 
                onChange={e=>{
                  const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
                  setField('bankNumber', value.slice(0, 19)); // Giới hạn 19 số
                }} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                placeholder="Nhập số tài khoản (8-19 chữ số)"
                maxLength={19}
                required
              />
            </Field>
            <Field label="Tên ngân hàng *">
              {loadingBanks ? (
                <div className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-gray-400 text-sm">
                  Đang tải danh sách ngân hàng...
                </div>
              ) : (
                <select
                  value={form.bankName}
                  onChange={(e) => setField('bankName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
                  required
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {banks.map((bank) => (
                    <option key={bank.acqId} value={bank.name || bank.shortName}>
                      {bank.name || bank.shortName}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Portfolio (tùy chọn)">
              <input 
                type="url"
                value={form.portfolioUrl} 
                onChange={e=>setField('portfolioUrl', e.target.value)} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                placeholder="https://example.com hoặc link tác phẩm, mạng xã hội, Google Drive..."
              />
              <p className="mt-1 text-xs text-gray-400">Ví dụ: https://drive.google.com/... hoặc https://facebook.com/...</p>
            </Field>
            <Field label="Giới thiệu bản thân (tùy chọn)">
              <textarea 
                value={form.bio} 
                onChange={e=>setField('bio', e.target.value)} 
                rows={4} 
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" 
                placeholder="Giới thiệu về bản thân, kinh nghiệm, tác phẩm..."
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-400">
                {form.bio?.length || 0}/1000 ký tự
              </p>
            </Field>
            <div>
              <label className={`flex items-start md:items-center gap-2 text-xs md:text-sm ${
                triedSubmit && !form.agreeTos 
                  ? 'text-red-300' 
                  : 'text-gray-300'
              }`}>
                <input 
                  type="checkbox" 
                  checked={form.agreeTos} 
                  onChange={e=>{
                    setField('agreeTos', e.target.checked);
                    if (e.target.checked) {
                      setTriedSubmit(false); // Reset error when checked
                      setError(""); // Clear error message
                    }
                  }} 
                  className={`w-4 h-4 rounded mt-0.5 md:mt-0 flex-shrink-0 ${
                    triedSubmit && !form.agreeTos 
                      ? 'border-red-500' 
                      : 'border-gray-600'
                  }`}
                  required
                />
                <span className="leading-relaxed">Tôi cam kết tuân thủ quy định và điều khoản của VieBook. *</span>
              </label>
              {triedSubmit && !form.agreeTos && (
                <p className="mt-2 text-xs md:text-sm text-red-400 flex items-start md:items-center gap-1">
                  <i className="ri-error-warning-line mt-0.5 md:mt-0 flex-shrink-0"></i>
                  <span>Bạn cần đồng ý điều khoản để tiếp tục đăng ký</span>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-4 md:py-6">
            <i className="ri-checkbox-circle-line text-4xl md:text-5xl text-green-500"></i>
            <p className="mt-2 text-base md:text-lg font-semibold px-2">Bạn đã đăng ký chủ sách thành công!</p>
            <p className="mt-3 text-xs md:text-sm text-gray-300 px-2">
              Vui lòng đăng nhập lại để sử dụng quyền chủ sách.
            </p>
            <p className="mt-2 text-xs text-gray-400 px-2">
              Bạn sẽ được chuyển đến trang đăng nhập sau vài giây...
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col md:flex-row justify-between gap-3 md:gap-0">
        <button onClick={back} disabled={step===1 || step===5} className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 order-2 md:order-1">Quay lại</button>
        {step < 4 && <button onClick={next} disabled={step===2 && !confirmationResult} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg order-1 md:order-2">Tiếp tục</button>}
        {step === 4 && (
          <button 
            onClick={submitAll} 
            disabled={loading} 
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
            title={!form.agreeTos ? "Vui lòng đồng ý điều khoản để tiếp tục" : ""}
          >
            Gửi đăng ký
          </button>
        )}
        {step === 5 && (
          <button 
            onClick={async () => {
              try {
                await logout();
                navigate("/auth");
              } catch (err) {
                navigate("/auth");
              }
            }} 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg order-1 md:order-2"
          >
            Đăng nhập ngay
          </button>
        )}
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
    <>
      {/* Mobile version với scroll */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((s, idx) => {
            const active = s.id === current;
            const done = s.id < current;
            return (
              <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${done ? 'bg-green-600' : active ? 'bg-orange-500' : 'bg-gray-600'}`}>
                    {s.id}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-4 h-[2px] bg-gray-600 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        {/* Hiển thị tên bước hiện tại trên mobile */}
        <div className="mt-2 text-center">
          <span className="text-sm text-white font-medium">
            {steps.find(s => s.id === current)?.title}
          </span>
        </div>
      </div>
      
      {/* Desktop version giữ nguyên như cũ */}
      <div className="hidden md:flex items-center gap-2">
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
    </>
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


