import React, { useState } from "react";
import {
    RiSearchLine,
    RiAddLine,
    RiBookLine,
    RiGiftLine,
    RiStarLine,
    RiCloseLine,
    RiBrainLine,
} from "react-icons/ri";

import PostList from "../components/forum/PostList";
import PopularTopics from "../components/forum/PopularTopics";
import ActiveUsers from "../components/forum/ActiveUsers";
import CreatePostModal from "../components/forum/CreatePostModal";
import bg from "../assets/forum-bg.png"; // ảnh nền

export default function ForumManager() {
    const [activeTab, setActiveTab] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ thêm tab Đã ẩn
    const tabs = [
        { id: "all", label: "Tất cả", icon: <RiBookLine /> },
        { id: "discuss", label: "Thảo luận", icon: <RiBrainLine /> },
        { id: "gift", label: "Tặng sách", icon: <RiGiftLine /> },
        { id: "registered", label: "Đã đăng ký", icon: <RiStarLine /> },
        { id: "hidden", label: "Đã ẩn", icon: <RiCloseLine /> },
    ];

    const popularTopics = [
        { name: "Sách tâm lý học", count: "2.3K người theo dõi", color: "bg-purple-500" },
        { name: "Kỹ năng mềm", count: "1.8K người theo dõi", color: "bg-blue-500" },
        { name: "Kinh doanh khởi nghiệp", count: "1.5K người theo dõi", color: "bg-green-500" },
        { name: "Phát triển bản thân", count: "2.1K người theo dõi", color: "bg-orange-500" },
        { name: "Lịch sử Việt Nam", count: "980 người theo dõi", color: "bg-red-500" },
        { name: "Tiểu thuyết hay", count: "1.2K người theo dõi", color: "bg-pink-500" },
        { name: "Sách nuôi dạy con", count: "850 người theo dõi", color: "bg-indigo-500" },
        { name: "Đầu tư tài chính", count: "1.7K người theo dõi", color: "bg-yellow-500" },
    ];

    const activeUsers = [
        { name: "Minh Phương", posts: 12, followers: 2300, avatar: null, isFollowing: true },
        { name: "Tuấn Anh", posts: 8, followers: 1800, avatar: null, isFollowing: true },
        { name: "Thu Hà", posts: 15, followers: 3100, avatar: null, isFollowing: false },
    ];

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            {/* Header */}
            <div className="relative bg-slate-900">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg})` }}
                />
                {/* Overlay tối */}
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative px-6 py-16">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4 text-white">Diễn đàn sách</h1>
                        <p className="text-lg text-slate-200 mb-8">
                            Nơi chia sẻ và thảo luận về những cuốn sách hay
                        </p>

                        {/* Search + Button */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                            <div className="relative flex-1 max-w-md">
                                <RiSearchLine
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết theo tiêu đề..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <RiAddLine size={20} />
                                Đăng bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? "border-orange-500 text-orange-500"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Posts Area */}
                    <div className="lg:col-span-3">
                        <PostList activeTab={activeTab} searchQuery={searchQuery} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Popular Topics */}
                        <PopularTopics topics={popularTopics} />

                        {/* Active Users */}
                        <ActiveUsers users={activeUsers} />
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
