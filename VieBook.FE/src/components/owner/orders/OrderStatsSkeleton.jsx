export default function OrderStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-slate-800 p-4 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
