import React from "react";
import CustomerManager from "../layouts/CustomerManager";

function CustomerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center">
      <main className="w-full max-w-7xl p-4 sm:p-8">
        {/* ⚡ pt-24 để đẩy nội dung xuống dưới header */}


        {/* Quản lý khách hàng */}
        <CustomerManager />
      </main>
    </div>
  );
}

export default CustomerPage;
