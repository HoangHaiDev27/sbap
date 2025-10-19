import React, { useEffect, useState } from "react";
import { isBookOwner } from "../api/authApi";
import { getOwnerPlans, purchaseOwnerPlan } from "../api/userApi";
import { useCoinsStore } from "../hooks/stores/coinStore";

export default function VipPackagesPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ownerPlans, setOwnerPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(isBookOwner());

  const coins = useCoinsStore((s) => s.coins || 0);
  const fetchCoins = useCoinsStore((s) => s.fetchCoins);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);

  useEffect(() => {
    const onAuthChanged = () => setIsOwner(isBookOwner());
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const plans = await getOwnerPlans();
        setOwnerPlans(plans);
      } catch (e) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "error", message: e.message },
          })
        );
      }
    })();
  }, []);

  // Hiển thị thông báo khi không có dữ liệu từ API
  const displayPlans = Array.isArray(ownerPlans) && ownerPlans.length > 0 ? ownerPlans : [];
  const hasPlans = displayPlans.length > 0;

  const faqs = [
    {
      question: "Có thể dùng trên tất cả thiết bị không?",
      answer:
        "Có, gói Premium cho phép sử dụng trên tất cả thiết bị và đồng bộ dữ liệu.",
    },
    {
      question: "Có thể tải về máy để nghe offline không?",
      answer:
        "Không, chỉ có thể nghe trực tiếp trên nền tảng và nghe online không giới hạn.",
    },
    {
      question: "Có bị giới hạn gì không?",
      answer:
        "Gói Premium có giới hạn về số lượng sách, không giới hạn số lần nghe.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Gói chuyển sách sang audio (dành cho chủ sách)
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Thanh toán bằng coin trong ví. Mỗi gói có giới hạn số lượt chuyển
            đổi.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-sm">
            <i className="ri-wallet-3-line text-orange-400"></i>
            <span>
              Coin hiện có:{" "}
              <span className="font-semibold text-white">
                {Number(coins).toLocaleString("vi-VN")} coin
              </span>
            </span>
          </div>
        </div>

        {/* Ẩn thông báo đối với user bình thường theo yêu cầu */}

        {/* Owner Plans (hiển thị cho tất cả, chỉ owner mới mua được) */}
        <div className="mb-12">
          <div className="text-center mb-12">
            {isOwner ? (
              <>
                <h2 className="text-3xl font-bold mb-4">Gói dành cho chủ sách</h2>
                <p className="text-gray-400">
                  Mua gói để chuyển sách sang audio theo hạn mức
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">Các gói chuyển sách sang audio</h2>
                <p className="text-gray-400">
                  Dành cho chủ sách. Vui lòng trở thành chủ sách để mua.
                </p>
              </>
            )}
          </div>
          
          {hasPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayPlans.map((p) => (
                <div
                  key={p.planId || p.name}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 border border-gray-600 uppercase">
                      {p.period}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-500 mb-3">
                    {p.price?.toLocaleString("vi-VN")} coin
                  </div>
                  <ul className="text-sm text-gray-300 space-y-2 mb-4">
                    <li className="flex items-start">
                      <i className="ri-sound-module-line text-orange-400 mr-2 mt-0.5"></i>{" "}
                      Số lượt chuyển đổi:{" "}
                      <span className="ml-1 text-white font-medium">
                        {p.conversionLimit} lần/kỳ
                      </span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-time-line text-orange-400 mr-2 mt-0.5"></i>{" "}
                      Chu kỳ:{" "}
                      <span className="ml-1 capitalize">
                        {String(p.period || '').toLowerCase()}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-recycle-line text-orange-400 mr-2 mt-0.5"></i>{" "}
                      Tự gia hạn: <span className="ml-1">Không (mua lẻ)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-book-open-line text-orange-400 mr-2 mt-0.5"></i>{" "}
                      Phạm vi: Chuyển đổi sách sang audio trực tuyến
                    </li>
                    <li className="flex items-start">
                      <i className="ri-customer-service-2-line text-orange-400 mr-2 mt-0.5"></i>{" "}
                      Hỗ trợ: Trong giờ hành chính
                    </li>
                  </ul>
                  {isOwner && p.planId ? (
                    <button
                      disabled={loading}
                      onClick={async () => {
                        setConfirmPlan(p);
                        setConfirmOpen(true);
                      }}
                      className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium"
                    >
                      Mua bằng coin
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-lg bg-gray-700 text-gray-300 cursor-not-allowed"
                      title={isOwner ? "Gói minh họa - vui lòng đăng nhập để xem gói thực" : "Chỉ chủ sách (book owner) mới có thể mua"}
                    >
                      {isOwner ? "Gói minh họa" : "Chỉ dành cho chủ sách"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-md mx-auto">
                <div className="text-6xl mb-4">
                  <i className="ri-error-warning-line text-orange-400"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Không thể tải gói VIP</h3>
                <p className="text-gray-400 mb-4">
                  Hiện tại không thể tải danh sách gói VIP. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal xác nhận mua gói */}
        {confirmOpen && confirmPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-white">
              <h3 className="text-xl font-semibold mb-3">Xác nhận mua gói</h3>
              <div className="text-sm text-gray-300 mb-4">
                <p className="mb-1">
                  Gói:{" "}
                  <span className="text-white font-medium">
                    {confirmPlan.name}
                  </span>{" "}
                  ({confirmPlan.period})
                </p>
                <p className="mb-1">
                  Giá:{" "}
                  <span className="text-orange-400 font-semibold">
                    {confirmPlan.price?.toLocaleString("vi-VN")} coin
                  </span>
                </p>
                <p>
                  Lượt chuyển đổi:{" "}
                  <span className="text-white font-medium">
                    {confirmPlan.conversionLimit}
                  </span>{" "}
                  lần/kỳ
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmPlan(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await purchaseOwnerPlan(confirmPlan.planId);

                      // 🔥 Reload coin ngay sau khi mua
                      await fetchCoins();

                      setConfirmOpen(false);
                      setConfirmPlan(null);
                      window.dispatchEvent(
                        new CustomEvent("app:toast", {
                          detail: {
                            type: "success",
                            message: "Mua gói thành công",
                          },
                        })
                      );
                    } catch (e) {
                      window.dispatchEvent(
                        new CustomEvent("app:toast", {
                          detail: { type: "error", message: e.message },
                        })
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận mua"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-400">Giải đáp những thắc mắc của bạn</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="mb-4">
                <button
                  className="w-full bg-gray-800 rounded-lg p-6 text-left hover:bg-gray-750 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4">
                      {faq.question}
                    </h3>
                    <div
                      className={`transform transition-transform duration-200 ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {expandedFaq === i && (
                    <div className="mt-4 text-gray-400">{faq.answer}</div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}