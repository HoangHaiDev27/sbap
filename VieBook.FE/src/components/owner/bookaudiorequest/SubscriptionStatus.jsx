import { useState, useEffect } from "react";
import { RiInformationLine } from "react-icons/ri";
import { getSubscriptionStatus } from "../../../api/ownerBookApi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

export default function SubscriptionStatus() {
  const { userId } = useCurrentUser();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSubscriptionStatus();
    }
  }, [userId]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionStatus(userId);
      
      if (response.success && response.hasSubscription) {
        setSubscription(response.subscription);
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy subscription status:", error);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-gray-400 text-sm">Đang tải thông tin subscription...</div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <RiInformationLine className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-2">Chưa có gói đăng ký</h3>
            <p className="text-gray-300 text-sm">
              Bạn cần đăng ký gói subscription để sử dụng tính năng chuyển đổi văn bản thành audio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isExpiringSoon = subscription && new Date(subscription.endAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isLowConversions = subscription && subscription.remainingConversions <= 5;

  return (
    <div className={`rounded-lg p-4 border ${
      isExpiringSoon || isLowConversions 
        ? "bg-yellow-900/30 border-yellow-500" 
        : "bg-slate-800 border-slate-600"
    }`}>
      <div className="flex items-start gap-3">
        <RiInformationLine className={`text-xl flex-shrink-0 mt-0.5 ${
          isExpiringSoon || isLowConversions ? "text-yellow-400" : "text-blue-400"
        }`} />
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Thông tin Subscription</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Gói:</span>
              <span className="text-white font-medium">{subscription.planName || "N/A"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Lượt chuyển đổi còn lại:</span>
              <span className={`font-medium ${
                isLowConversions ? "text-yellow-400" : "text-white"
              }`}>
                {subscription.remainingConversions}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Hết hạn:</span>
              <span className={`font-medium ${
                isExpiringSoon ? "text-yellow-400" : "text-white"
              }`}>
                {new Date(subscription.endAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {(isExpiringSoon || isLowConversions) && (
            <div className="mt-3 pt-3 border-t border-yellow-500/30">
              <p className="text-yellow-300 text-xs">
                {isExpiringSoon && "⚠️ Subscription của bạn sắp hết hạn. "}
                {isLowConversions && "⚠️ Số lượt chuyển đổi còn lại ít."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

