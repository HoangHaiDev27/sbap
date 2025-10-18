import { useState, useEffect } from "react";
import { RiMoneyDollarCircleLine, RiHistoryLine, RiInformationLine } from "react-icons/ri";
import { getMe } from "../../api/userApi";

export default function WithdrawPage() {
  // dữ liệu từ API
  const [walletCoins, setWalletCoins] = useState(0);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState([
    { id: 1, amount: 500000, bank: "Vietcombank", account: "123456789", status: "Đã duyệt", date: "15/09/2025" },
    { id: 2, amount: 200000, bank: "Techcombank", account: "987654321", status: "Đang xử lý", date: "17/09/2025" },
  ]);

  useEffect(() => {
    let mounted = true;
    getMe()
      .then((res) => {
        if (!mounted) return;
        const profile = res?.profile || {};
        const coins = res?.wallet ?? 0; // server lưu ví theo coin
        const bankName = profile.BankName || profile.bankName || "";
        const bankNumber = profile.BankNumber || profile.bankNumber || "";
        setWalletCoins(Number(coins) || 0);
        setBank(bankName);
        setAccount(bankNumber);
      })
      .catch(() => {
        // giữ giá trị mặc định nếu lỗi
      });
    return () => {
      mounted = false;
    };
  }, []);

  const coinsNeeded = amount ? Math.floor(amount / 1000) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseInt(amount);

    // Validate
    if (isNaN(value) || value <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }
    if (value < 50000) {
      setError("Số tiền rút tối thiểu là 50.000 VNĐ");
      return;
    }
    // Kiểm tra theo coin (1 coin = 1.000đ)
    const requiredCoins = Math.floor(value / 1000);
    if (requiredCoins > walletCoins) {
      setError("Số dư coin không đủ để thực hiện giao dịch");
      return;
    }

    setError("");

    const newRecord = {
      id: history.length + 1,
      amount: value,
      bank,
      account,
      status: "Đang xử lý",
      date: new Date().toLocaleDateString("vi-VN"),
    };

    setHistory([newRecord, ...history]);
    setAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <RiMoneyDollarCircleLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rút tiền</h1>
            <p className="text-gray-400">Quản lý yêu cầu rút tiền của bạn</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Số dư hiện tại</p>
            <p className="text-3xl font-bold">
              {walletCoins.toLocaleString("vi-VN")} coin
            </p>
          </div>
          <RiMoneyDollarCircleLine className="w-12 h-12 text-green-200" />
        </div>
      </div>

      {/* Form rút tiền */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <RiMoneyDollarCircleLine className="w-5 h-5 mr-2 text-orange-500" />
            Yêu cầu rút tiền
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số tiền cần rút (VNĐ)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Nhập số tiền"
                required
              />
              {amount && (
                <p className="text-sm mt-2 text-gray-400">
                  Tương ứng: <span className="text-yellow-400 font-semibold">{coinsNeeded} coin</span>
                </p>
              )}
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tài khoản nhận (từ hồ sơ)
              </label>
              <div className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600">
                {bank || account ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{bank || "Ngân hàng"}</span>
                    <span className="text-gray-100 font-mono font-semibold">{account || "Chưa có STK"}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Chưa có thông tin ngân hàng. Vui lòng cập nhật trong hồ sơ.</span>
                )}
              </div>
              {/* Hidden inputs to submit along with the request */}
              <input type="hidden" value={bank} readOnly />
              <input type="hidden" value={account} readOnly />
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RiInformationLine className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="space-y-1 text-blue-300">
                  <li>• Số tiền rút tối thiểu: 50.000 VNĐ</li>
                  <li>• Yêu cầu sẽ được xử lý trong vòng 1-3 ngày làm việc</li>
                  <li>• Phí giao dịch: 0 VNĐ (miễn phí)</li>
                  <li>• Cập nhật thông tin ngân hàng trong trang hồ sơ nếu thiếu</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Gửi yêu cầu rút tiền
          </button>
        </form>
      </div>

      {/* Lịch sử giao dịch */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <RiHistoryLine className="w-5 h-5 mr-2 text-orange-500" />
            Lịch sử rút tiền
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ngân hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Số tài khoản
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    <RiHistoryLine className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p>Chưa có giao dịch rút tiền nào</p>
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {h.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {h.bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {h.account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-400">
                      {h.amount.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {h.status === "Đã duyệt" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                          ✓ {h.status}
                        </span>
                      ) : h.status === "Đang xử lý" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                          ⏳ {h.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                          ✗ {h.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
