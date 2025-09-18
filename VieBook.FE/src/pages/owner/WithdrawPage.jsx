import { useState } from "react";

export default function WithdrawPage() {
  // số dư giả sử từ API
  const [balance] = useState(1250000); // 1.250.000 VNĐ
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState([
    { id: 1, amount: 500000, bank: "Vietcombank", account: "123456789", status: "Đã duyệt", date: "15/09/2025" },
    { id: 2, amount: 200000, bank: "Techcombank", account: "987654321", status: "Đang xử lý", date: "17/09/2025" },
  ]);

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
    if (value > balance) {
      setError("Số dư không đủ để thực hiện giao dịch");
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
    setBank("");
    setAccount("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💵 Yêu cầu rút tiền</h1>

      <div className="mb-4 text-sm text-gray-400">
        Số dư hiện tại:{" "}
        <span className="text-green-400 font-semibold">
          {balance.toLocaleString("vi-VN")} VNĐ
        </span>{" "}
        (~ {Math.floor(balance / 1000)} coin)
      </div>

      {/* Form rút tiền */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 mb-8"
      >
        <div>
          <label className="block text-sm mb-1">Số tiền cần rút (VNĐ)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập số tiền"
            required
          />
          {amount && (
            <p className="text-sm mt-1 text-gray-400">
              Tương ứng:{" "}
              <span className="text-yellow-400 font-semibold">
                {coinsNeeded} coin
              </span>
            </p>
          )}
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Ngân hàng</label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="VD: Vietcombank"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Số tài khoản</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập số tài khoản"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold"
        >
          Xác nhận rút tiền
        </button>
      </form>

      {/* Lịch sử giao dịch */}
      <h2 className="text-xl font-semibold mb-4">📜 Lịch sử rút tiền</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Ngày</th>
              <th className="px-4 py-2 text-left text-sm">Ngân hàng</th>
              <th className="px-4 py-2 text-left text-sm">Số TK</th>
              <th className="px-4 py-2 text-right text-sm">Số tiền</th>
              <th className="px-4 py-2 text-center text-sm">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t border-gray-600">
                <td className="px-4 py-2 text-sm">{h.date}</td>
                <td className="px-4 py-2 text-sm">{h.bank}</td>
                <td className="px-4 py-2 text-sm">{h.account}</td>
                <td className="px-4 py-2 text-sm text-right text-green-400">
                  {h.amount.toLocaleString("vi-VN")} đ
                </td>
                <td className="px-4 py-2 text-sm text-center">
                  {h.status === "Đã duyệt" ? (
                    <span className="text-green-400">{h.status}</span>
                  ) : (
                    <span className="text-yellow-400">{h.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
