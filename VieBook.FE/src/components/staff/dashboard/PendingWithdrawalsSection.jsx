import { useNavigate } from 'react-router-dom';

export default function PendingWithdrawalsSection({ withdrawals, onApprove, onReject }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/staff/withdrawals');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Yêu cầu rút tiền</h3>
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
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={handleViewAll}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{withdrawal.owner}</h4>
                  <p className="text-sm text-gray-600">{withdrawal.amount}</p>
                  <p className="text-xs text-gray-500">{withdrawal.date}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Không có yêu cầu rút tiền</p>
          )}
        </div>
      </div>
    </div>
  );
}

