import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RiBookReadLine,
  RiHeadphoneLine,
  RiShoppingBagLine,
  RiHeartLine,
} from "react-icons/ri";
import ReadingHistory from "../components/library/ReadingHistory";
import ListeningHistory from "../components/library/ListeningHistory";
import PurchasedBook from "../components/library/PurchasedBook";
import FavoriteBook from "../components/library/FavoriteBook";

export default function LibraryManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("reading");

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['reading', 'listening', 'purchased', 'favorites'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const stats = [
    {
      label: "Sách đã nghe",
      value: 142,
      color: "bg-blue-500",
      icon: <RiHeadphoneLine size={28} />,
    },
    {
      label: "Tổng thời gian",
      value: "847h",
      color: "bg-green-500",
      icon: <RiBookReadLine size={28} />,
    },
    {
      label: "Sách đã mua",
      value: 89,
      color: "bg-purple-500",
      icon: <RiShoppingBagLine size={28} />,
    },
    {
      label: "Yêu thích",
      value: 37,
      color: "bg-orange-500",
      icon: <RiHeartLine size={28} />,
    },
  ];

  const tabs = [
    { id: "reading", label: "Lịch sử đọc", icon: <RiBookReadLine /> },
    { id: "listening", label: "Lịch sử nghe", icon: <RiHeadphoneLine /> },
    { id: "purchased", label: "Đã mua", icon: <RiShoppingBagLine /> },
    { id: "favorites", label: "Yêu thích", icon: <RiHeartLine /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "reading":
        return <ReadingHistory />;
      case "listening":
        return <ListeningHistory />;
      case "purchased":
        return <PurchasedBook />;
      case "favorites":
        return <FavoriteBook />;
      default:
        return <ReadingHistory />;
    }
  };

  return (
    <div className="bg-gray-900  p-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">Thư viện của tôi</h1>
      <p className="text-gray-400 mb-6">
        Quản lý tất cả nội dung đã nghe và yêu thích của bạn
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
        <div className="flex justify-evenly border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap font-medium transition-colors border-b-2 flex-1 justify-center ${
                activeTab === tab.id
                  ? "text-orange-500 border-orange-500 bg-gray-750"
                  : "text-gray-400 border-transparent hover:text-white hover:bg-gray-750"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
