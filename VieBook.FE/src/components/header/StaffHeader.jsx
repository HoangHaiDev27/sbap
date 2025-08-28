import React from "react";

function StaffHeader() {
  return (
    <header className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Staff Panel</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Staff</span>
        </div>
      </div>
    </header>
  );
}

export default StaffHeader;
