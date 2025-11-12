import React, { useEffect, useState } from "react";
import { isBookOwner, getUserId } from "../api/authApi";
import { getOwnerPlans, purchaseOwnerPlan } from "../api/userApi";
import { getSubscriptionStatus } from "../api/ownerBookApi";
import { useCoinsStore } from "../hooks/stores/coinStore";
import { useNotificationStore } from "../hooks/stores/notificationStore";

export default function VipPackagesPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ownerPlans, setOwnerPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(isBookOwner());
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const coins = useCoinsStore((s) => s.coins || 0);
  const fetchCoins = useCoinsStore((s) => s.fetchCoins);
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

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

  // Fetch subscription status khi là owner
  useEffect(() => {
    if (isOwner) {
      (async () => {
        try {
          setLoadingSubscription(true);
          const userId = getUserId();
          if (userId) {
            const response = await getSubscriptionStatus(userId);
            if (response.success && response.hasSubscription) {
              setSubscription(response.subscription);
            } else {
              setSubscription(null);
            }
          }
        } catch (e) {
          console.error("Error fetching subscription status:", e);
          setSubscription(null);
        } finally {
          setLoadingSubscription(false);
        }
      })();
    } else {
      setSubscription(null);
      setLoadingSubscription(false);
    }
  }, [isOwner]);

  // Hiển thị thông báo khi không có dữ liệu từ API
  const displayPlans = Array.isArray(ownerPlans) && ownerPlans.length > 0 ? ownerPlans : [];
  const hasPlans = displayPlans.length > 0;

  // Kiểm tra xem có thể mua gói mới không và trạng thái subscription
  // Chỉ cho phép mua khi: không có subscription active HOẶC subscription đã hết hạn HOẶC hết lượt
  const subscriptionStatus = React.useMemo(() => {
    if (!isOwner || !subscription) {
      return { canPurchase: true, status: 'none' }; // Không có subscription thì có thể mua
    }
    
    const now = new Date();
    const endAt = new Date(subscription.endAt);
    const isExpired = now >= endAt;
    const isOutOfConversions = subscription.remainingConversions <= 0;
    
    // Tính số ngày còn lại
    const daysRemaining = Math.ceil((endAt - now) / (1000 * 60 * 60 * 24));
    
    // Xác định màu dựa trên thời gian còn lại VÀ số lượt chuyển đổi còn lại
    let colorStatus = 'green'; // Mặc định màu xanh
    const remainingConversions = subscription.remainingConversions;
    
    // Đỏ: Hết hạn HOẶC hết lượt
    if (isExpired || remainingConversions <= 0) {
      colorStatus = 'red';
    } 
    // Vàng: Gần hết hạn (<= 3 ngày) HOẶC sắp hết lượt (<= 5 lượt)
    else if (daysRemaining <= 3 || remainingConversions <= 5) {
      colorStatus = 'yellow';
    } 
    // Xanh: Còn nhiều thời gian (> 3 ngày) VÀ còn nhiều lượt (> 5 lượt)
    else {
      colorStatus = 'green';
    }
    
    if (isExpired && isOutOfConversions) {
      return { canPurchase: true, status: 'expired_and_empty', subscription, colorStatus, daysRemaining };
    } else if (isExpired) {
      return { canPurchase: true, status: 'expired', subscription, colorStatus, daysRemaining };
    } else if (isOutOfConversions) {
      return { canPurchase: true, status: 'out_of_conversions', subscription, colorStatus, daysRemaining };
    } else {
      return { canPurchase: false, status: 'active', subscription, colorStatus, daysRemaining };
    }
  }, [isOwner, subscription]);

  const canPurchasePlan = subscriptionStatus.canPurchase;

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
            Gói chuyển sách sang audio
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Thanh toán bằng xu trong ví. Mỗi gói có giới hạn số lượt chuyển
            đổi.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-sm">
            <i className="ri-wallet-3-line text-orange-400"></i>
            <span>
              Xu hiện có:{" "}
              <span className="font-semibold text-white">
                {Number(coins).toLocaleString("vi-VN")} xu
              </span>
            </span>
          </div>
        </div>

        {/* Thông báo subscription hiện tại */}
        {isOwner && subscriptionStatus.subscription && (
          (() => {
            const { subscription: sub, colorStatus, daysRemaining, status } = subscriptionStatus;
            const isExpired = daysRemaining <= 0;
            
            // Xác định màu và class CSS dựa trên colorStatus
            const colorConfig = {
              green: {
                bg: 'from-green-900/30 to-emerald-900/30',
                border: 'border-green-500/50',
                iconBg: 'bg-green-500/20',
                iconColor: 'text-green-400',
                titleColor: 'text-green-400',
                textColor: 'text-green-300/80',
                icon: 'ri-checkbox-circle-line'
              },
              yellow: {
                bg: 'from-yellow-900/30 to-orange-900/30',
                border: 'border-yellow-500/50',
                iconBg: 'bg-yellow-500/20',
                iconColor: 'text-yellow-400',
                titleColor: 'text-yellow-400',
                textColor: 'text-yellow-300/80',
                icon: 'ri-time-line'
              },
              red: {
                bg: 'from-red-900/30 to-orange-900/30',
                border: 'border-red-500/50',
                iconBg: 'bg-red-500/20',
                iconColor: 'text-red-400',
                titleColor: 'text-red-400',
                textColor: 'text-red-300/80',
                icon: 'ri-alert-line'
              }
            };
            
            const colors = colorConfig[colorStatus] || colorConfig.green;
            
            return (
              <div className={`mb-8 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-2xl p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                    <i className={`${colors.icon} ${colors.iconColor} text-2xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${colors.titleColor} mb-2`}>
                      {status === 'active' 
                        ? 'Bạn đang có gói đang hoạt động'
                        : status === 'expired'
                        ? 'Gói của bạn đã hết hạn'
                        : status === 'out_of_conversions'
                        ? 'Gói của bạn đã hết lượt chuyển đổi'
                        : 'Gói của bạn đã hết hạn và hết lượt'
                      }
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Gói hiện tại:</span>
                        <span className="text-white font-medium">{sub.planName || "N/A"}</span>
                      </div>
                      {status !== 'expired_and_empty' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Lượt chuyển đổi còn lại:</span>
                            <span className={`font-semibold ${
                              sub.remainingConversions <= 0 ? 'text-red-400' : 'text-white'
                            }`}>
                              {sub.remainingConversions} lượt
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              {isExpired ? 'Đã hết hạn vào:' : 'Hết hạn vào:'}
                            </span>
                            <span className="text-white font-medium">
                              {new Date(sub.endAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {!isExpired && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Còn lại:</span>
                              <span className={`font-semibold ${
                                daysRemaining <= 3 ? colors.titleColor : 'text-white'
                              }`}>
                                {daysRemaining} ngày
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <p className={`mt-3 text-sm ${colors.textColor}`}>
                      {status === 'active'
                        ? 'Chỉ có thể mua gói mới khi gói hiện tại hết hạn hoặc hết lượt chuyển đổi.'
                        : status === 'expired'
                        ? 'Bạn có thể mua gói mới ngay bây giờ.'
                        : status === 'out_of_conversions'
                        ? 'Bạn có thể mua gói mới để tiếp tục sử dụng dịch vụ.'
                        : 'Vui lòng mua gói mới để tiếp tục sử dụng dịch vụ chuyển đổi sách sang audio.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* Owner Plans (hiển thị cho tất cả, chỉ owner mới mua được) */}
        <div className="mb-16">
          {hasPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {displayPlans.map((p) => (
                <div
                  key={p.planId || p.name}
                  className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-medium uppercase">
                      {p.period}
                    </span>
                  </div>
                  <div className="mb-6 pb-4 border-b border-gray-700/50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-500">
                        {p.price?.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-base font-medium text-orange-400">Xu</span>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-3 mb-6">
                    <li className="flex items-start">
                      <i className="ri-sound-module-line text-orange-400 mr-3 mt-0.5 text-lg flex-shrink-0"></i>
                      <span>
                        Số lượt chuyển đổi:{" "}
                        <span className="ml-1 text-white font-semibold">
                          {p.conversionLimit} lần/{String(p.period || '').toLowerCase()}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-time-line text-orange-400 mr-3 mt-0.5 text-lg flex-shrink-0"></i>
                      <span>
                        Chu kỳ:{" "}
                        <span className="ml-1 capitalize text-white font-medium">
                          {String(p.period || '').toLowerCase()}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-recycle-line text-orange-400 mr-3 mt-0.5 text-lg flex-shrink-0"></i>
                      <span>
                        Tự gia hạn: <span className="ml-1 text-gray-400">Không</span>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-book-open-line text-orange-400 mr-3 mt-0.5 text-lg flex-shrink-0"></i>
                      <span>Chuyển đổi sách sang audio trực tuyến</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-customer-service-2-line text-orange-400 mr-3 mt-0.5 text-lg flex-shrink-0"></i>
                      <span>
                        Hỗ trợ: <span className="ml-1 text-green-400 font-semibold">24/7</span>
                      </span>
                    </li>
                  </ul>
                  {isOwner && p.planId ? (
                    canPurchasePlan ? (
                      <button
                        disabled={loading || loadingSubscription}
                        onClick={async () => {
                          setConfirmPlan(p);
                          setConfirmOpen(true);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading || loadingSubscription ? "Đang xử lý..." : "Mua bằng Xu"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50"
                        title={
                          subscriptionStatus.subscription
                            ? `Bạn đang có gói "${subscriptionStatus.subscription.planName}" còn hiệu lực. Chỉ có thể mua gói mới khi gói hiện tại hết hạn hoặc hết lượt chuyển đổi.`
                            : "Đang kiểm tra trạng thái gói..."
                        }
                      >
                        Đang có gói hoạt động
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50"
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
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => {
              if (!loading) {
                setConfirmOpen(false);
                setConfirmPlan(null);
              }
            }}
          >
            <div 
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-orange-400 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold">Xác nhận mua gói</h3>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 space-y-3 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gói:</span>
                  <span className="text-white font-semibold">
                    {confirmPlan.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chu kỳ:</span>
                  <span className="text-white font-medium capitalize">
                    {String(confirmPlan.period || '').toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Giá:</span>
                  <span className="text-orange-400 font-bold text-lg">
                    {confirmPlan.price?.toLocaleString("vi-VN")} xu
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lượt chuyển đổi:</span>
                  <span className="text-white font-semibold">
                    {confirmPlan.conversionLimit} lần/kỳ
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors font-medium"
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmPlan(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await purchaseOwnerPlan(confirmPlan.planId);

                      // 🔥 Reload xu ngay sau khi mua
                      await fetchCoins();

                      // 🔄 Refresh subscription status sau khi mua
                      const userId = getUserId();
                      if (userId) {
                        try {
                          const response = await getSubscriptionStatus(userId);
                          if (response.success && response.hasSubscription) {
                            setSubscription(response.subscription);
                          } else {
                            setSubscription(null);
                          }
                        } catch (subError) {
                          console.error("Error refreshing subscription:", subError);
                        }
                      }

                      // 🔔 Fetch notifications để hiển thị thông báo mua gói thành công
                      if (userId) {
                        try {
                          await Promise.all([
                            fetchNotifications(userId),
                            fetchUnreadCount(userId)
                          ]);
                        } catch (notifError) {
                          console.error("Error fetching notifications:", notifError);
                          // Không làm gián đoạn flow nếu fetch notification lỗi
                        }
                      }

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

        {/* Divider */}
        <div className="my-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <i className="ri-question-line text-gray-600 text-2xl"></i>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Câu hỏi thường gặp</h2>
            <p className="text-gray-400 text-lg">Giải đáp những thắc mắc của bạn</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="mb-4">
                <button
                  className="w-full bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 text-left hover:from-gray-700 hover:to-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg hover:shadow-xl"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4 text-white">
                      {faq.question}
                    </h3>
                    <div
                      className={`transform transition-transform duration-300 flex-shrink-0 ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    >
                      <i className={`ri-arrow-down-s-line text-2xl text-orange-400 ${expandedFaq === i ? 'text-orange-500' : ''}`}></i>
                    </div>
                  </div>
                  {expandedFaq === i && (
                    <div className="mt-4 pt-4 border-t border-gray-700 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
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