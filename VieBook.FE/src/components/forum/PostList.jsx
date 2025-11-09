import React, { useState, useEffect } from "react";
import {
  RiHeartLine,
  RiHeartFill,
  RiMessage3Line,
  RiEyeLine,
  RiBookLine,
  RiGiftLine,
  RiTimeLine,
  RiUserLine,
  RiStarLine,
  RiMoreLine,
  RiCloseLine,
} from "react-icons/ri";
import { getPosts, deletePost, updatePostVisibility } from "../../api/postApi";
import { toggleReaction, getUserReaction } from "../../api/postReactionApi";
import { getComments, createComment } from "../../api/postCommentApi";
import { createBookClaim, hasUserClaimed } from "../../api/bookClaimApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import toast from "react-hot-toast";

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default function PostList({ activeTab = "all", searchQuery = "", tag = null, authorId = null, subTab = null }) {
  const { userId } = useCurrentUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userReactions, setUserReactions] = useState({}); // { postId: reaction }
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState({}); // { postId: [comments] }
  const [quickComments, setQuickComments] = useState({});
  const [loadingReactions, setLoadingReactions] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [reportPost, setReportPost] = useState(null); // lưu post đang report
  const [reportText, setReportText] = useState("");
  const [dropdownPost, setDropdownPost] = useState(null);
  const [modalCommentText, setModalCommentText] = useState("");
  const [modalReplyTexts, setModalReplyTexts] = useState({});
  const [openReplyBox, setOpenReplyBox] = useState({});
  const [userClaims, setUserClaims] = useState({}); // { offerId: boolean } - track if user has claimed
  const [claimingOfferId, setClaimingOfferId] = useState(null); // Track which offer is being claimed
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null); // Post to be deleted (for confirmation modal)
  const [isDeleting, setIsDeleting] = useState(false); // Track if deletion is in progress

  // Load posts from API
  useEffect(() => {
    loadPosts();
  }, [activeTab, searchQuery, tag, authorId, subTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Handle different tabs
      if (activeTab === "discuss") {
        params.postType = "discuss";
      } else if (activeTab === "gift") {
        params.postType = "giveaway";
      } else if (activeTab === "registered") {
        params.filter = "registered";
      } else if (activeTab === "my-posts") {
        params.filter = "my-posts";
        // subTab: "all" or "hidden"
        if (subTab === "hidden") {
          params.subFilter = "hidden";
        } else {
          params.subFilter = "all";
        }
      } else {
        // "all" tab - load all posts
        params.postType = null;
      }
      
      // Add search query if provided
      if (searchQuery && searchQuery.trim()) {
        params.searchQuery = searchQuery.trim();
      }

      // Add tag filter if provided
      if (tag) {
        params.tag = tag;
      }

      // Add author filter if provided
      if (authorId) {
        params.authorId = authorId;
      }
      
      const data = await getPosts(params);
      const postsArray = Array.isArray(data) ? data : (data?.data || []);
      
      // Posts are already filtered by visibility in the backend
      // my-posts/all returns Public posts, my-posts/hidden returns Hidden posts
      // Other tabs only return Public posts
      setPosts(postsArray);

      // Load user reactions for all posts
      if (userId) {
        loadUserReactions(postsArray.map(p => p.postId));
        // Load user claims for all offers
        await loadUserClaims(postsArray);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast.error("Không thể tải danh sách bài viết");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user claims status for all offers
  const loadUserClaims = async (postsArray) => {
    if (!userId) return;
    
    const claimsMap = {};
    const offerIds = postsArray
      .filter(p => p.bookOffer?.bookOfferId)
      .map(p => p.bookOffer.bookOfferId);

    for (const offerId of offerIds) {
      try {
        const hasClaimed = await hasUserClaimed(offerId);
        claimsMap[offerId] = hasClaimed;
      } catch (error) {
        console.error(`Failed to check claim status for offer ${offerId}:`, error);
        claimsMap[offerId] = false;
      }
    }
    
    setUserClaims(claimsMap);
  };

  // Handle claim book offer
  const handleClaimOffer = async (offerId, postId) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để đăng ký nhận sách");
      return;
    }

    if (userClaims[offerId]) {
      toast.error("Bạn đã đăng ký nhận sách này rồi");
      return;
    }

    try {
      setClaimingOfferId(offerId);
      
      // Get the post to find the bookOffer details
      const post = posts.find(p => p.postId === postId);
      if (!post?.bookOffer) {
        toast.error("Không tìm thấy thông tin sách");
        return;
      }

      const claimData = {
        bookOfferId: offerId,
        chapterId: post.bookOffer.chapterId || null,
        audioId: post.bookOffer.audioId || null,
        note: null
      };

      await createBookClaim(claimData);
      
      // Update user claims
      setUserClaims(prev => ({ ...prev, [offerId]: true }));
      
      // Reload posts to get updated claim count
      await loadPosts();
      
      toast.success("Đã đăng ký nhận sách thành công!");
    } catch (error) {
      console.error("Failed to claim offer:", error);
      toast.error(error.message || "Không thể đăng ký nhận sách. Vui lòng thử lại.");
    } finally {
      setClaimingOfferId(null);
    }
  };

  // Format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
  };

  // Filter posts based on searchQuery
  // Note: Visibility filtering is done server-side, only search is done client-side as backup
  const filteredPosts = posts.filter((post) => {
    // All posts are already filtered by visibility in the backend
    // Only apply client-side search filter if searchQuery is provided
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery.length > 0) {
      // Remove # if present at the start (for hashtag search)
      const searchTerm = normalizedQuery.startsWith("#") ? normalizedQuery.substring(1) : normalizedQuery;
      
      const matchesTitle = post.title?.toLowerCase().includes(searchTerm);
      const matchesContent = post.content?.toLowerCase().includes(searchTerm);
      // Also search in tags/hashtags (contains search)
      const matchesTags = post.tags && Array.isArray(post.tags) 
        ? post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        : false;
      if (!matchesTitle && !matchesContent && !matchesTags) return false;
    }

    return true;
  });

  const loadUserReactions = async (postIds) => {
    if (!userId) return;
    try {
      const reactions = {};
      await Promise.all(
        postIds.map(async (postId) => {
          try {
            const reaction = await getUserReaction(postId);
            if (reaction) {
              reactions[postId] = reaction;
            }
          } catch (error) {
            // User not authenticated or no reaction - ignore
          }
        })
      );
      setUserReactions((prev) => ({ ...prev, ...reactions }));
    } catch (error) {
      console.error("Failed to load user reactions:", error);
    }
  };

  const toggleLike = async (postId) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    try {
      setLoadingReactions((prev) => ({ ...prev, [postId]: true }));
      const result = await toggleReaction(postId, "Like");
      
      if (result.removed) {
        // Reaction was removed
        setUserReactions((prev) => {
          const updated = { ...prev };
          delete updated[postId];
          return updated;
        });
        // Update post reaction count
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId
              ? { ...p, reactionCount: Math.max(0, p.reactionCount - 1) }
              : p
          )
        );
      } else {
        // Reaction was added/updated
        setUserReactions((prev) => ({ ...prev, [postId]: result }));
        // Update post reaction count
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId
              ? { ...p, reactionCount: p.reactionCount + (userReactions[postId] ? 0 : 1) }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Không thể thích bài viết");
    } finally {
      setLoadingReactions((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const loadPostComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      const comments = await getComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error("Failed to load comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleQuickComment = async (postId) => {
    if (!quickComments[postId]?.trim()) return;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      await createComment(postId, quickComments[postId].trim());
      setQuickComments((prev) => ({ ...prev, [postId]: "" }));
      
      // Update comment count
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        )
      );
      
      // Reload comments
      await loadPostComments(postId);
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error(error.message || "Không thể thêm bình luận");
    }
  };

  const handleHidePost = async (postId) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để ẩn bài viết");
      return;
    }

    try {
      await updatePostVisibility(postId, "Hidden");
      toast.success("Đã ẩn bài viết");
      setDropdownPost(null);
      // Reload posts to reflect the change
      await loadPosts();
    } catch (error) {
      console.error("Failed to hide post:", error);
      toast.error(error.message || "Không thể ẩn bài viết");
    }
  };

  const handleUnhidePost = async (postId) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để hiển thị lại bài viết");
      return;
    }

    try {
      await updatePostVisibility(postId, "Public");
      toast.success("Đã hiển thị lại bài viết");
      // Reload posts to reflect the change
      await loadPosts();
    } catch (error) {
      console.error("Failed to unhide post:", error);
      toast.error(error.message || "Không thể hiển thị lại bài viết");
    }
  };

  const handleDeletePost = (post) => {
    // Show confirmation modal
    setDeleteConfirmPost(post);
    setDropdownPost(null);
  };

  const confirmDeletePost = async () => {
    if (!deleteConfirmPost || !userId) return;

    try {
      setIsDeleting(true);
      await deletePost(deleteConfirmPost.postId);
      toast.success("Đã xóa bài viết");
      
      // Remove from posts list
      setPosts((prev) => prev.filter((p) => p.postId !== deleteConfirmPost.postId));
      
      setDeleteConfirmPost(null);
      
      // Reload posts to refresh the list
      await loadPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Không thể xóa bài viết");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = (post) => {
    setReportPost(post);
    setDropdownPost(null);
  };

  const handleAddModalComment = async () => {
    const text = modalCommentText.trim();
    if (!selectedPost || text.length === 0) return;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      await createComment(selectedPost.postId, text);
      setModalCommentText("");
      
      // Update comment count
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === selectedPost.postId
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        )
      );
      
      // Reload comments
      await loadPostComments(selectedPost.postId);
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error(error.message || "Không thể thêm bình luận");
    }
  };

  // handleAddReply is now handled inline in the render

  const getPostTypeIcon = (type) => {
    switch (type) {
      case "giveaway":
        return <RiGiftLine className="text-green-500" size={18} />;
      case "discussion":
        return <RiBookLine className="text-blue-500" size={18} />;
      default:
        return <RiMessage3Line className="text-gray-500" size={18} />;
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case "giveaway":
        return "Tặng sách";
      case "discussion":
        return "Thảo luận";
      default:
        return "Hỏi đáp";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Post List */}
      {filteredPosts.map((post) => (
        <div
          key={post.postId}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors relative"
        >
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                {post.author?.userProfile?.avatarUrl ? (
                  <img src={post.author.userProfile.avatarUrl} alt={post.author.fullName} className="w-full h-full object-cover" />
                ) : (
                  <RiUserLine className="text-slate-400" size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{post.author?.fullName || post.author?.email || "Người dùng"}</h3>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {post.author?.role || "Thành viên"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <RiTimeLine size={14} />
                  <span>{getTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <div className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {getPostTypeIcon(post.postType)}
                <span>{getPostTypeLabel(post.postType)}</span>
              </div>
              
              {/* Unhide button in my-posts/hidden subTab - displayed in header */}
              {activeTab === "my-posts" && subTab === "hidden" && (
                <button
                  onClick={() => handleUnhidePost(post.postId)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                >
                  Hiển thị lại
                </button>
              )}

              {!(activeTab === "my-posts" && subTab === "hidden") && (
                <>
                  <button
                    className="text-slate-400 hover:text-white p-1"
                    onClick={() =>
                      setDropdownPost(dropdownPost === post.postId ? null : post.postId)
                    }
                  >
                    <RiMoreLine size={18} />
                  </button>

                  {/* Dropdown */}
                  {dropdownPost === post.postId && (
                    <div className="absolute right-0 top-6 bg-slate-700 rounded shadow-md w-40 z-10 border border-slate-600">
                      {post.authorId === userId && (
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white text-sm"
                        >
                          Xóa
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleHidePost(post.postId);
                          setDropdownPost(null);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white text-sm"
                      >
                        Ẩn
                      </button>
                      {post.authorId !== userId && (
                        <button
                          onClick={() => {
                            handleReport(post);
                            setDropdownPost(null);
                          }}
                          className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white text-sm"
                        >
                          Báo cáo
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-3 leading-relaxed">
              {post.title || "Không có tiêu đề"}
            </h2>
            <p className="text-slate-300 leading-relaxed">{post.content || ""}</p>
          </div>

          {/* Book Info */}
          {post.bookOffer?.book && (
            <div className="bg-slate-750 rounded-lg p-4 mb-4 border border-slate-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {post.bookOffer.book.coverUrl ? (
                    <img src={post.bookOffer.book.coverUrl} alt={post.bookOffer.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <RiBookLine className="text-slate-400" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    {post.bookOffer.book.title}
                  </h4>
                  {post.bookOffer.chapter && (
                    <p className="text-sm text-slate-300 mb-2">
                      Chương: {post.bookOffer.chapter.chapterTitle}
                    </p>
                  )}
                  {post.bookOffer.quantity > 0 && (
                    <span className="text-sm bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      Số suất còn lại: {Math.max(0, post.bookOffer.quantity - (post.bookOffer.claimCount || 0))}/{post.bookOffer.quantity}
                    </span>
                  )}
                </div>
                {post.postType === "giveaway" && post.bookOffer && (
                  <div className="flex flex-col gap-2">
                    {userClaims[post.bookOffer.bookOfferId] ? (
                      <button
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                        disabled
                      >
                        Đã đăng ký
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleClaimOffer(post.bookOffer.bookOfferId, post.postId)}
                        disabled={claimingOfferId === post.bookOffer.bookOfferId || !userId}
                      >
                        {claimingOfferId === post.bookOffer.bookOfferId ? "Đang xử lý..." : "Đăng ký"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-6">
              <button
                onClick={() => toggleLike(post.postId)}
                disabled={loadingReactions[post.postId]}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {userReactions[post.postId] ? (
                  <RiHeartFill className="text-red-500" size={18} />
                ) : (
                  <RiHeartLine size={18} />
                )}
                <span className="text-sm">{post.reactionCount}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPost(post);
                  if (!postComments[post.postId]) {
                    loadPostComments(post.postId);
                  }
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <RiMessage3Line size={18} />
                <span className="text-sm">{post.commentCount}</span>
              </button>
            </div>
          </div>

          {/* Quick Comment Box */}
          <div className="mt-3 flex items-center gap-2">
            <input
              value={quickComments[post.postId] || ""}
              onChange={(e) =>
                setQuickComments((prev) => ({
                  ...prev,
                  [post.postId]: e.target.value,
                }))
              }
              placeholder="Viết bình luận..."
              className="flex-1 bg-slate-700 text-white rounded px-3 py-2 outline-none"
            />
            <button
              onClick={() => handleQuickComment(post.postId)}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
            >
              Gửi
            </button>
          </div>
        </div>
      ))}

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <RiBookLine className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">Không tìm thấy bài viết nào</p>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 w-full max-w-2xl rounded-lg p-6 relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <RiCloseLine size={24} />
            </button>

            <h2 className="text-xl font-bold text-white mb-3">
              {selectedPost.title || "Không có tiêu đề"}
            </h2>
            <p className="text-slate-300 mb-6">{selectedPost.content || ""}</p>

            <h3 className="text-lg font-semibold text-white mb-4">Bình luận</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {loadingComments[selectedPost.postId] ? (
                <div className="text-slate-400 text-center py-4">Đang tải bình luận...</div>
              ) : postComments[selectedPost.postId]?.length > 0 ? (
                postComments[selectedPost.postId].map((cmt) => (
                  <div key={cmt.commentId} className="bg-slate-700 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                        {cmt.user?.userProfile?.avatarUrl ? (
                          <img src={cmt.user.userProfile.avatarUrl} alt={cmt.user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <RiUserLine className="text-slate-400" size={16} />
                        )}
                      </div>
                      <p className="text-white font-medium text-sm">
                        {cmt.user?.fullName || cmt.user?.email || "Người dùng"}
                      </p>
                      <span className="text-xs text-slate-400">{getTimeAgo(cmt.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm ml-10">{cmt.content}</p>
                    <div className="mt-2 ml-10">
                      <button
                        className="text-xs text-slate-300 hover:text-white underline"
                        onClick={() =>
                          setOpenReplyBox((prev) => ({ ...prev, [cmt.commentId]: !prev[cmt.commentId] }))
                        }
                      >
                        Trả lời
                      </button>
                    </div>
                    {cmt.replies?.length > 0 && (
                      <div className="pl-4 mt-2 space-y-2 border-l border-slate-600 ml-10">
                        {cmt.replies.map((rep) => (
                          <div key={rep.commentId} className="bg-slate-600 p-2 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-white font-medium">
                                {rep.user?.fullName || rep.user?.email || "Người dùng"}
                              </p>
                              <span className="text-xs text-slate-400">{getTimeAgo(rep.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-300">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {openReplyBox[cmt.commentId] && (
                      <div className="mt-3 ml-10 flex items-center gap-2">
                        <input
                          value={modalReplyTexts[cmt.commentId] || ""}
                          onChange={(e) =>
                            setModalReplyTexts((prev) => ({ ...prev, [cmt.commentId]: e.target.value }))
                          }
                          placeholder="Trả lời bình luận..."
                          className="flex-1 bg-slate-600 text-white rounded px-3 py-2 outline-none text-sm"
                        />
                        <button
                          onClick={async () => {
                            const replyText = modalReplyTexts[cmt.commentId]?.trim();
                            if (!replyText) return;
                            if (!userId) {
                              toast.error("Vui lòng đăng nhập để trả lời");
                              return;
                            }
                            try {
                              await createComment(selectedPost.postId, replyText, cmt.commentId);
                              setModalReplyTexts((prev) => ({ ...prev, [cmt.commentId]: "" }));
                              setOpenReplyBox((prev) => ({ ...prev, [cmt.commentId]: false }));
                              await loadPostComments(selectedPost.postId);
                              toast.success("Đã thêm trả lời");
                            } catch (error) {
                              toast.error(error.message || "Không thể thêm trả lời");
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded text-white text-sm"
                        >
                          Trả lời
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-4">Chưa có bình luận nào</div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={modalCommentText}
                onChange={(e) => setModalCommentText(e.target.value)}
                placeholder="Viết bình luận mới..."
                className="flex-1 bg-slate-700 text-white rounded px-3 py-2 outline-none"
              />
              <button
                onClick={handleAddModalComment}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white"
              >
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup báo cáo */}
      {reportPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-lg p-6 relative border border-slate-700">
            <button
              onClick={() => {
                setReportPost(null);
                setReportText("");
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <RiCloseLine size={24} />
            </button>

            <h2 className="text-lg font-bold text-white mb-3">Báo cáo bài viết</h2>
            <p className="text-slate-300 mb-3">{reportPost.title || "Không có tiêu đề"}</p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full bg-slate-700 text-white rounded p-2 mb-4 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="4"
              placeholder="Nhập lý do báo cáo..."
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReportPost(null);
                  setReportText("");
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert("Báo cáo đã được gửi!");
                  setReportPost(null);
                  setReportText("");
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận xóa */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-lg p-6 relative border border-slate-700">
            <button
              onClick={() => setDeleteConfirmPost(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              disabled={isDeleting}
            >
              <RiCloseLine size={24} />
            </button>

            <h2 className="text-lg font-bold text-white mb-3">Xác nhận xóa bài viết</h2>
            <p className="text-slate-300 mb-4">
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
            </p>
            <div className="bg-slate-700 rounded-lg p-3 mb-4 border border-slate-600">
              <p className="text-white font-medium mb-1">{deleteConfirmPost.title || "Không có tiêu đề"}</p>
              <p className="text-slate-300 text-sm line-clamp-2">{deleteConfirmPost.content || ""}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
