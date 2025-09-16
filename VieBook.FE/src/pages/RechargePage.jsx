import React, { useState } from "react";
import { RiArrowLeftLine, RiCoinLine } from "react-icons/ri";
import { Link } from "react-router-dom";

export default function RechargePage() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("banking");

  const presetAmounts = [
    { amount: 50000, coins: 50, bonus: 2 },
    { amount: 100000, coins: 100, bonus: 5 },
    { amount: 200000, coins: 200, bonus: 10 },
    { amount: 500000, coins: 500, bonus: 20 },
    { amount: 1000000, coins: 1000, bonus: 30 },
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleRecharge = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10,000 VNĐ");
      return;
    }
    
    // Giả lập nạp tiền
    alert(`Đang xử lý nạp ${amount.toLocaleString()} VNĐ...`);
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
            <p className="text-2xl font-bold text-yellow-400">1,250 xu</p>
          </div>
        </div>
      </div>

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
                    {item.coins.toLocaleString()} xu
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Hoặc nhập số tiền tùy chỉnh
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={customAmount}
                onChange={handleCustomAmount}
                placeholder="Nhập số tiền (VNĐ)"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="px-4 py-2 bg-gray-600 rounded-lg text-gray-300">
                VNĐ
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tối thiểu 10,000 VNĐ
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
                {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Số xu cơ bản:</span>
              <span className="font-bold text-yellow-400">
                {((selectedAmount || parseInt(customAmount) || 0) / 1000).toLocaleString()} xu
              </span>
            </div>
            {selectedAmount && presetAmounts.find(item => item.amount === selectedAmount)?.bonus > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Xu thưởng:</span>
                <span className="font-bold">
                  +{presetAmounts.find(item => item.amount === selectedAmount)?.bonus} xu
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng xu nhận được:</span>
              <span className="text-yellow-400">
                {(() => {
                  const amount = selectedAmount || parseInt(customAmount) || 0;
                  const baseCoins = amount / 1000;
                  const bonus = selectedAmount ? presetAmounts.find(item => item.amount === selectedAmount)?.bonus || 0 : 0;
                  return (baseCoins + bonus).toLocaleString();
                })()} xu
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
                {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>

      {/* Nút nạp tiền */}
      <button
        onClick={handleRecharge}
        disabled={!selectedAmount && !customAmount}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
      >
        Nạp tiền ngay
      </button>
    </div>
  );
}
