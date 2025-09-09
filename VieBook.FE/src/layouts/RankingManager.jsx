import React, { useState } from "react";
import {
  RiTrophyLine,
  RiFireLine,
  RiTimeLine,
  RiStarLine,
} from "react-icons/ri";
import PopularBooks from "../components/ranking/PopularBooks";
import TrendingBooks from "../components/ranking/TrendingBooks";
import NewReleases from "../components/ranking/NewReleases";
import TopRated from "../components/ranking/TopRated";

export default function RankingManager() {
  const [activeTab, setActiveTab] = useState("popular");

  const stats = [
    {
      label: "Top sách hot",
      value: 150,
      color: "bg-red-500",
      icon: <RiFireLine size={28} />,
    },
    {
      label: "Mới phát hành",
      value: 23,
      color: "bg-blue-500",
      icon: <RiTimeLine size={28} />,
    },
    {
      label: "Đánh giá cao",
      value: 89,
      color: "bg-yellow-500",
      icon: <RiStarLine size={28} />,
    },
    {
      label: "Phổ biến nhất",
      value: 342,
      color: "bg-green-500",
      icon: <RiTrophyLine size={28} />,
    },
  ];

  const tabs = [
    { id: "popular", label: "Phổ biến", icon: <RiTrophyLine /> },
    { id: "trending", label: "Xu hướng", icon: <RiFireLine /> },
    { id: "new", label: "Mới nhất", icon: <RiTimeLine /> },
    { id: "rated", label: "Đánh giá cao", icon: <RiStarLine /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "popular":
        return <PopularBooks />;
      case "trending":
        return <TrendingBooks />;
      case "new":
        return <NewReleases />;
      case "rated":
        return <TopRated />;
      default:
        return <PopularBooks />;
    }
  };

  return (
    <div className="bg-gray-900 p-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">Bảng xếp hạng</h1>
      <p className="text-gray-400 mb-6">
        Khám phá những cuốn sách được yêu thích và xu hướng nhất
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
              onClick={() => setActiveTab(tab.id)}
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