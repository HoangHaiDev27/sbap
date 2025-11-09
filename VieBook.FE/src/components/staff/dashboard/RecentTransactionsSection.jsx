import { useNavigate } from 'react-router-dom';

export default function RecentTransactionsSection({ transactions }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/staff/transactions');
  };

  const getStatusColor = (status) => {
    return status === 'Thành công'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
          <button
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{transaction.user}</h4>
                  <p className="text-sm text-gray-600">{transaction.type}</p>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium text-gray-900">{transaction.amount}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Không có giao dịch</p>
          )}
        </div>
      </div>
    </div>
  );
}

