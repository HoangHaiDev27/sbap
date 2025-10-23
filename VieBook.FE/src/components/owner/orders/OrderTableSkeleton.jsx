export default function OrderTableSkeleton() {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow">
      {/* Filter skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="h-10 bg-gray-700 rounded flex-1 animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded w-48 animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-700 text-gray-300">
              {[...Array(7)].map((_, i) => (
                <th key={i} className="p-3">
                  <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-600">
                {[...Array(7)].map((_, colIndex) => (
                  <td key={colIndex} className="p-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center items-center mt-4">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
