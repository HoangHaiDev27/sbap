import React, { useState, useEffect, useMemo } from "react";
import {
    RiSearchLine,
    RiAddLine,
    RiBookLine,
    RiGiftLine,
    RiStarLine,
    RiCloseLine,
    RiBrainLine,
    RiUserLine,
} from "react-icons/ri";

import PostList from "../components/forum/PostList";
import PopularTopics from "../components/forum/PopularTopics";
import ActiveUsers from "../components/forum/ActiveUsers";
import CreatePostModal from "../components/forum/CreatePostModal";
import { getPosts } from "../api/postApi";
import { isBookOwner, getUserId } from "../api/authApi";
import { useCurrentUser } from "../hooks/useCurrentUser";
import bg from "../assets/forum-bg.png"; // ảnh nền

const COLORS = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500", "bg-cyan-500", "bg-teal-500"];

export default function ForumManager() {
    const { userId } = useCurrentUser();
    const [activeTab, setActiveTab] = useState("all");
    const [myPostsSubTab, setMyPostsSubTab] = useState("all"); // "all" or "hidden"
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedAuthorId, setSelectedAuthorId] = useState(null);
    const [allPosts, setAllPosts] = useState([]);
    const [reloadKey, setReloadKey] = useState(0); // Key để trigger reload PostList

    const tabs = [
        { id: "all", label: "Tất cả", icon: <RiBookLine /> },
        { id: "discuss", label: "Thảo luận", icon: <RiBrainLine /> },
        { id: "gift", label: "Tặng sách", icon: <RiGiftLine /> },
        { id: "registered", label: "Đã đăng ký", icon: <RiStarLine /> },
        { id: "my-posts", label: "Bài đăng của tôi", icon: <RiUserLine /> },
    ];

    // Load all posts to calculate popular topics and active users
    useEffect(() => {
        loadAllPosts();
    }, []);

    const loadAllPosts = async () => {
        try {
            const data = await getPosts({});
            const postsArray = Array.isArray(data) ? data : (data?.data || []);
            setAllPosts(postsArray);
        } catch (error) {
            console.error("Failed to load posts for sidebar:", error);
        }
    };

    // Calculate popular topics from posts tags - limit to 5
    const popularTopics = useMemo(() => {
        const tagCounts = {};
        allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Limit to 5 tags
            .map(([tag, count], index) => ({
                name: tag,
                count: `${count} bài viết`,
                color: COLORS[index % COLORS.length]
            }));

        return sortedTags;
    }, [allPosts]);

    // Calculate active owners (book owners) based on total reactions - limit to 5
    const activeUsers = useMemo(() => {
        const ownerReactions = {};
        const ownerPosts = {}; // Track if user has giveaway posts (owners only)
        
        // First pass: identify owners (users who created giveaway posts)
        allPosts.forEach(post => {
            if (post.author && post.postType === "giveaway") {
                const userId = post.author.userId;
                ownerPosts[userId] = true;
            }
        });
        
        // Second pass: calculate total reactions for owners only
        allPosts.forEach(post => {
            if (post.author && ownerPosts[post.author.userId]) {
                const userId = post.author.userId;
                if (!ownerReactions[userId]) {
                    ownerReactions[userId] = {
                        userId: userId,
                        name: post.author.fullName || post.author.email || "Người dùng",
                        totalReactions: 0,
                        followers: 0, // TODO: Get from API
                        avatar: post.author.userProfile?.avatarUrl || null,
                        isFollowing: false // TODO: Get from API
                    };
                }
                // Add reaction count from this post
                ownerReactions[userId].totalReactions += post.reactionCount || 0;
            }
        });

        // Sort by total reactions and limit to 5
        return Object.values(ownerReactions)
            .sort((a, b) => b.totalReactions - a.totalReactions)
            .slice(0, 5);
    }, [allPosts]);

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
                                    placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung hoặc hashtag (ví dụ: #tâm lí)..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedTag(null);
                                        setSelectedAuthorId(null);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                            {getUserId() && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                >
                                    <RiAddLine size={20} />
                                    Đăng bài
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col">
                        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSelectedTag(null);
                                        setSelectedAuthorId(null);
                                        setSearchQuery("");
                                        if (tab.id === "my-posts") {
                                            setMyPostsSubTab("all"); // Reset to "all" when switching to my-posts
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-4 border-b-2 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                                        activeTab === tab.id
                                            ? "border-orange-500 text-orange-500"
                                            : "border-transparent text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <span className="text-base sm:text-lg">{tab.icon}</span>
                                    <span className="text-sm sm:text-base">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Sub-tabs for "my-posts" */}
                        {activeTab === "my-posts" && userId && (
                            <div className="flex space-x-4 pl-4 pb-2 border-b border-slate-700">
                                <button
                                    onClick={() => setMyPostsSubTab("all")}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                                        myPostsSubTab === "all"
                                            ? "text-orange-400 border-b-2 border-orange-400"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Tất cả bài đăng
                                </button>
                                <button
                                    onClick={() => setMyPostsSubTab("hidden")}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                                        myPostsSubTab === "hidden"
                                            ? "text-orange-400 border-b-2 border-orange-400"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Đã ẩn
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Posts Area */}
                    <div className="lg:col-span-3">
                        {/* Show active filters */}
                        {(selectedTag || selectedAuthorId) && (
                            <div className="mb-4 flex items-center gap-2 flex-wrap">
                                {selectedTag && (
                                    <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        <span>#{selectedTag}</span>
                                        <button
                                            onClick={() => setSelectedTag(null)}
                                            className="hover:text-orange-300 text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                {selectedAuthorId && (
                                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        <span>Tác giả: {activeUsers.find(u => u.userId === selectedAuthorId)?.name || "Unknown"}</span>
                                        <button
                                            onClick={() => setSelectedAuthorId(null)}
                                            className="hover:text-blue-300 text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <PostList 
                            key={reloadKey}
                            activeTab={activeTab} 
                            searchQuery={searchQuery}
                            tag={selectedTag}
                            authorId={selectedAuthorId}
                            subTab={activeTab === "my-posts" ? myPostsSubTab : null}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Popular Topics */}
                        <PopularTopics 
                            topics={popularTopics}
                            onTagClick={(tagName) => {
                                setSelectedTag(tagName);
                                setSelectedAuthorId(null);
                                setSearchQuery("");
                                setActiveTab("all");
                            }}
                        />

                        {/* Active Users */}
                        <ActiveUsers 
                            users={activeUsers}
                            onUserClick={(userId) => {
                                setSelectedAuthorId(userId);
                                setSelectedTag(null);
                                setSearchQuery("");
                                setActiveTab("all");
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal 
                    onClose={() => {
                        setShowCreateModal(false);
                    }}
                    onPostCreated={() => {
                        // Reload danh sách bài viết sau khi đăng bài
                        setReloadKey(prev => prev + 1);
                        loadAllPosts(); // Reload all posts for sidebar
                    }}
                />
            )}
        </div>
    );
}
