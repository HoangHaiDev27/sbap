import React, { useState } from "react";
import {
  RiUserLine,
  RiBookReadLine,
  RiHeadphoneLine,
  RiExchangeDollarLine,
} from "react-icons/ri";
import UserProfile from "../components/user/UserProfile";
function ReadingSchedule() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch trình đọc sách</h2>
      <p className="text-gray-400">
        Danh sách lịch trình đọc sách sẽ hiển thị ở đây.
      </p>
    </div>
  );
}

function ListeningSchedule() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch trình nghe sách</h2>
      <p className="text-gray-400">
        Danh sách lịch trình nghe sách sẽ hiển thị ở đây.
      </p>
    </div>
  );
}

function TransactionHistory() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>
      <p className="text-gray-400">
        Thông tin giao dịch của khách hàng sẽ hiển thị ở đây.
      </p>
    </div>
  );
}

export default function CustomerManager() {
  const [activeTab, setActiveTab] = useState("personal");

  const stats = [
    {
      label: "Sách đang đọc",
      value: 12,
      color: "bg-blue-500",
      icon: <RiBookReadLine size={28} />,
    },
    {
      label: "Sách đang nghe",
      value: 8,
      color: "bg-green-500",
      icon: <RiHeadphoneLine size={28} />,
    },
    {
      label: "Tổng giao dịch",
      value: 23,
      color: "bg-purple-500",
      icon: <RiExchangeDollarLine size={28} />,
    },
    {
      label: "Khách hàng",
      value: "VIP",
      color: "bg-orange-500",
      icon: <RiUserLine size={28} />,
    },
  ];

  const tabs = [
    { id: "personal", label: "Thông tin cá nhân", icon: <RiUserLine /> },
    { id: "reading", label: "Lịch trình đọc sách", icon: <RiBookReadLine /> },
    {
      id: "listening",
      label: "Lịch trình nghe sách",
      icon: <RiHeadphoneLine />,
    },
    {
      id: "transactions",
      label: "Lịch sử giao dịch",
      icon: <RiExchangeDollarLine />,
    },
  ];

  const tabComponents = {
    personal: <UserProfile />,
    reading: <ReadingSchedule />,
    listening: <ListeningSchedule />,
    transactions: <TransactionHistory />,
  };

  return (
    <div className="bg-gray-900 p-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">Quản lý khách hàng</h1>
      <p className="text-gray-400 mb-6">
        Theo dõi thông tin cá nhân, lịch trình và lịch sử giao dịch của khách
        hàng
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-xl p-4 flex items-center space-x-3 shadow-lg`}
          >
            <div className="text-white">{stat.icon}</div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="flex overflow-x-auto border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap font-medium transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? "text-orange-500 border-b-2 border-orange-500 bg-gray-750"
                  : "text-gray-400 border-b-2 border-transparent hover:text-white hover:bg-gray-750"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">{tabComponents[activeTab]}</div>
      </div>
    </div>
  );
}
