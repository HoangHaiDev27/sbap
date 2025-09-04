import React from "react";
import CustomerManager from "../layouts/CustomerManager";

function CustomerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center">
      <main className="w-full max-w-7xl p-8">
        {/* Thông tin khách hàng */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-4xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nguyễn Văn An</h1>
              <p className="text-gray-400">Thành viên từ 15/03/2023</p>
              <div className="flex items-center space-x-6 mt-3">
                <div className="flex items-center space-x-1">
                  <i className="ri-vip-crown-fill text-yellow-500 text-lg"></i>
                  <span className="text-yellow-500 text-sm font-semibold">
                    VIP Member
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  <i className="ri-book-line mr-1"></i>
                  142 sách đã nghe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quản lý khách hàng */}
        <CustomerManager />
      </main>
    </div>
  );
}

export default CustomerPage;
