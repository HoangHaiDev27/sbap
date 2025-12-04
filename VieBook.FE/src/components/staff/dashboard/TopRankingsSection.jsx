export default function TopRankingsSection({ topBooks, topOwners }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Top 5 Sách bán chạy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Sách bán chạy</h3>
            {/* <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
              Bestseller
            </span> */}
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topBooks && topBooks.length > 0 ? (
              topBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                      <p className="text-sm text-gray-600">Tác giả: {book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {book.salesCount || 0} lượt mua
                        </span>
                        {book.revenue && (
                          <span className="text-xs text-emerald-600 font-medium">
                            {book.revenue} xu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Owners */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Chủ sách</h3>
            {/* <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
              Top thực hiện
            </span> */}
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topOwners && topOwners.length > 0 ? (
              topOwners.map((owner, index) => (
                <div
                  key={owner.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{owner.name}</h4>
                      <p className="text-sm text-gray-600">{owner.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {owner.bookCount || 0} sách
                        </span>
                        {owner.revenue && (
                          <span className="text-xs text-emerald-600 font-medium">
                            {owner.revenue} xu doanh thu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

