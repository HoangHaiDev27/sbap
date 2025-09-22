import React, { useEffect, useState } from "react";
import { RiArrowLeftLine, RiCoinLine, RiCheckboxCircleLine, RiCheckboxBlankCircleLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import PaymentModal from "../components/payment/PaymentModal";
import PaymentPolicy from "../components/payment/PaymentPolicy";
import { usePayment } from "../hooks/usePayment";
import { usePaymentModal } from "../hooks/usePaymentModal";
import { useRechargeForm } from "../hooks/useRechargeForm";
import { useCoinsStore } from "../hooks/stores/coinStore";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function RechargePage() {
  // State cho checkbox đồng ý điều khoản
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Custom hooks
  const { isLoading, processPayment } = usePayment();
  const { 
    showPaymentModal, 
    paymentStatus, 
    paymentMessage, 
    paymentAmount, 
    handleCloseModal 
  } = usePaymentModal();
  const {
    selectedAmount,
    customAmount,
    paymentMethod,
    presetAmounts,
    suggestions,
    showSuggestions,
    handleAmountSelect,
    handleCustomAmount,
    handleSuggestionSelect,
    handleInputFocus,
    handleInputBlur,
    getCurrentAmount,
    getTotalCoins,
    getBonusCoins,
    formatCoins,
    isFormValid
  } = useRechargeForm();
  
  // Coin store và user info
  const { coins, fetchCoins } = useCoinsStore();
  const { userId, isAuthenticated } = useCurrentUser();
  
  // Fetch coins when component mounts
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchCoins(userId);
    }
  }, [isAuthenticated, userId, fetchCoins]);

  const handleRecharge = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để nạp tiền");
      return;
    }

    if (!agreeToTerms) {
      alert("Vui lòng đồng ý với điều khoản sử dụng trước khi nạp tiền");
      return;
    }

    const amount = getCurrentAmount();
    
    if (!isFormValid()) {
      alert("Số tiền nạp tối thiểu là 10,000 VNĐ");
      return;
    }

    try {
      await processPayment(amount);
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra khi tạo link thanh toán. Vui lòng thử lại.");
    }
  };

  // Kiểm tra tất cả điều kiện để hiển thị button nạp tiền
  const canProceedWithPayment = () => {
    return isAuthenticated && isFormValid() && agreeToTerms;
  };

  return (
    <div className="bg-gray-900 p-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RiArrowLeftLine className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">Nạp tiền</h1>
      </div>
      {/* Số dư hiện tại */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <RiCoinLine className="text-yellow-400 w-8 h-8" />
          <div>
            <p className="text-gray-400 text-sm">Số dư hiện tại</p>
            <p className="text-2xl font-bold text-yellow-400">
              {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
            </p>
          </div>
        </div>
      </div>


      {/* Chính sách nạp tiền */}
      <PaymentPolicy />

      {/* Chọn số tiền */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">Chọn số tiền nạp</h2>
          
          {/* Gói có sẵn */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {presetAmounts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleAmountSelect(item.amount)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAmount === item.amount
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-500">
                    {item.amount.toLocaleString()} VNĐ
                  </p>
                  <p className="text-sm text-gray-300">
                    {parseFloat(item.coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} xu
                  </p>
                  {item.bonus > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      +{item.bonus} xu thưởng
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Nhập số tiền tùy chỉnh */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Hoặc nhập số tiền tùy chỉnh
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Nhập số tiền (VNĐ)"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                {/* Suggestion Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <p className="text-xs text-gray-400 mb-2">Gợi ý số tiền:</p>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect(suggestion.value)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="px-4 py-2 bg-gray-600 rounded-lg text-gray-300">
                VNĐ
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tối thiểu 10,000 VNĐ • Nhập số để xem gợi ý
            </p>
          </div>
        </div>

      {/* Phương thức thanh toán */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏦</span>
            </div>
            <div>
              <p className="font-medium text-white">Chuyển khoản ngân hàng</p>
              <p className="text-sm text-gray-400">Chuyển khoản qua ngân hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tóm tắt */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Tóm tắt giao dịch</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Số tiền nạp:</span>
              <span className="font-bold">
                {(getCurrentAmount() || 0).toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Số xu cơ bản:</span>
              <span className="font-bold text-yellow-400">
                {formatCoins((getCurrentAmount() || 0) / 1000).toLocaleString()} xu
              </span>
            </div>
            {getBonusCoins() > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Xu thưởng:</span>
                <span className="font-bold">
                  +{getBonusCoins()} xu
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng xu nhận được:</span>
              <span className="text-yellow-400">
                {formatCoins(getTotalCoins() || 0).toLocaleString()} xu
              </span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Phí giao dịch:</span>
              <span>Miễn phí</span>
            </div>
            <hr className="border-gray-600" />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-orange-500">
                {(getCurrentAmount() || 0).toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>

      {/* Checkbox đồng ý điều khoản */}
      <div className={`rounded-xl p-6 mb-6 transition-all duration-300 ${
        agreeToTerms 
          ? 'bg-gray-800 border border-green-500/30' 
          : 'bg-gray-800 border border-orange-500/50'
      }`}>
        <div className="flex items-start space-x-3">
          <button
            onClick={() => setAgreeToTerms(!agreeToTerms)}
            className="flex-shrink-0 mt-1 transition-all duration-200 hover:scale-110"
          >
            {agreeToTerms ? (
              <RiCheckboxCircleLine className="w-6 h-6 text-green-400" />
            ) : (
              <RiCheckboxBlankCircleLine className="w-6 h-6 text-orange-400" />
            )}
          </button>
          <div className="flex-1">
            <label className="text-sm text-gray-300 cursor-pointer">
              Tôi đã đọc và đồng ý với{" "}
              <span className="text-orange-400 font-semibold">
                chính sách nạp tiền
              </span>{" "}
              và{" "}
              <span className="text-orange-400 font-semibold">
                điều khoản sử dụng
              </span>{" "}
              của nền tảng. 
            </label>
          
          </div>
        </div>
      </div>

      {/* Nút nạp tiền */}
      <button
        onClick={handleRecharge}
        disabled={!canProceedWithPayment() || isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
      >
        {!isAuthenticated 
          ? "Vui lòng đăng nhập" 
          : !agreeToTerms
            ? "Vui lòng đồng ý với điều khoản sử dụng"
            : isLoading 
              ? "Đang tạo link thanh toán..." 
              : "Nạp tiền ngay"
        }
      </button>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        status={paymentStatus}
        message={paymentMessage}
        amount={paymentAmount}
      />
    </div>
  );
}
