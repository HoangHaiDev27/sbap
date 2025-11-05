import { useState, useEffect } from "react";
import { RiMoneyDollarCircleLine, RiHistoryLine, RiInformationLine, RiCoinLine } from "react-icons/ri";
import { getMe } from "../../api/userApi";
import { createPaymentRequest, getUserPaymentRequests } from "../../api/paymentRequestApi";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function WithdrawPage() {
  // dữ liệu từ API
  const [walletCoins, setWalletCoins] = useState(0);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Notification store
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore();
  const { userId } = useCurrentUser();

  useEffect(() => {
    let mounted = true;
    
    // Load user profile and wallet
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

    // Load payment requests history
    getUserPaymentRequests()
      .then((data) => {
        if (!mounted) return;
        const paymentRequests = Array.isArray(data) ? data : [];
        setHistory(paymentRequests);
      })
      .catch((err) => {
        console.error("Error loading payment requests:", err);
        if (!mounted) return;
        setHistory([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Tính số tiền sau khi trừ 10%: 1 xu = 1.000 VNĐ, nhưng khi rút chỉ nhận 90%
  const vndAmount = amount ? Math.floor(parseInt(amount) * 1000 * 0.9) : 0;
  const originalVndAmount = amount ? parseInt(amount) * 1000 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coinsValue = parseInt(amount);

    // Validate
    if (isNaN(coinsValue) || coinsValue <= 0) {
      setError("Số xu không hợp lệ");
      return;
    }
    if (coinsValue < 50) {
      setError("Số xu rút tối thiểu là 50 xu (nhận được 45.000 VNĐ sau phí 10%)");
      return;
    }
    // Kiểm tra số dư xu
    if (coinsValue > walletCoins) {
      setError("Số dư xu không đủ để thực hiện giao dịch");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Gọi API để tạo payment request (backend sẽ tự trừ xu và tạo notification)
      const result = await createPaymentRequest(coinsValue);
      
      // Reload history sau khi tạo thành công
      const updatedHistory = await getUserPaymentRequests();
      setHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
      
      // Reload wallet từ API để có số dư chính xác
      const userData = await getMe();
      setWalletCoins(Number(userData?.wallet ?? 0));
      
      // Reload notifications để hiển thị thông báo mới
      if (userId) {
        await fetchNotifications(userId);
        await fetchUnreadCount(userId);
      }
      
      // Reset form
      setAmount("");
    } catch (err) {
      console.error("Error creating payment request:", err);
      setError(err.message || "Không thể tạo yêu cầu rút tiền. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Map status từ API sang tiếng Việt
  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Đang xử lý";
      case "Processing":
        return "Đang xử lý";
      case "Succeeded":
        return "Đã duyệt";
      case "Rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  // Map status để hiển thị badge màu
  const getStatusBadge = (status) => {
    switch (status) {
      case "Succeeded":
        return "bg-green-900 text-green-300";
      case "Pending":
      case "Processing":
        return "bg-yellow-900 text-yellow-300";
      case "Rejected":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  // Format date - Convert UTC to Vietnam timezone (UTC+7)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Convert UTC to Vietnam timezone (UTC+7)
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vietnamDate.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <RiCoinLine className="w-4 h-4 text-yellow-400" />
                Số xu muốn rút
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Nhập số xu"
                required
              />
              {amount && (
                <div className="text-sm mt-2 space-y-1">
                  <p className="text-gray-400">
                    Số tiền nhận được: <span className="text-green-400 font-semibold">
                      {vndAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    (Đã trừ 10% phí: {originalVndAmount.toLocaleString("vi-VN")} VNĐ → {vndAmount.toLocaleString("vi-VN")} VNĐ)
                  </p>
                </div>
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
                  <li className="flex items-center gap-1">
                    <RiCoinLine className="w-4 h-4 text-yellow-400" />
                    <span>Số xu rút tối thiểu: 50 xu (nhận được 45.000 VNĐ sau phí)</span>
                  </li>
                  <li>• Phí rút tiền: 10% (ví dụ: 50 xu → 45.000 VNĐ)</li>
                  <li>• Yêu cầu sẽ được xử lý trong vòng 1-3 ngày làm việc</li>
                  <li>• Cập nhật thông tin ngân hàng trong trang hồ sơ nếu thiếu</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu rút tiền"}
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
                history.map((h) => {
                  const statusLabel = getStatusLabel(h.status);
                  const statusIcon = h.status === "Succeeded" ? "✓" : h.status === "Rejected" ? "✗" : "⏳";
                  return (
                    <tr key={h.paymentRequestId} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(h.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bank || "Chưa có"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {account || "Chưa có STK"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-400">
                        {Math.floor(h.amountReceived).toLocaleString("vi-VN")} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(h.status)}`}>
                          {statusIcon} {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
