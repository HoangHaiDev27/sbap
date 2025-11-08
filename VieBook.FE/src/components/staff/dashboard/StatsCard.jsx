export default function StatsCard({ title, value, change, icon, color }) {
  const getChangeColor = () => {
    if (change.includes('+') || change.includes('Chờ')) {
      return 'text-orange-600';
    }
    if (change.includes('-')) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

