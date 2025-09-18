import React, { useState } from "react";
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

export default function PostList({ activeTab = "all", searchQuery = "" }) {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [selectedPost, setSelectedPost] = useState(null);
  const [quickComments, setQuickComments] = useState({});
  const [hiddenPosts, setHiddenPosts] = useState([]); // lưu post ẩn
  const [reportPost, setReportPost] = useState(null); // lưu post đang report
  const [reportText, setReportText] = useState("");
  const [dropdownPost, setDropdownPost] = useState(null);
  const [modalCommentText, setModalCommentText] = useState("");
  const [modalReplyTexts, setModalReplyTexts] = useState({});
  const [openReplyBox, setOpenReplyBox] = useState({});

  const samplePosts = [
    {
      id: 1,
      type: "discussion",
      title: 'Tặng 5 cuốn "Atomic Habits" - Thay đổi tí hon, hiệu quả bất ngờ?',
      content:
        'Mình có 5 cuốn "Atomic Habits" muốn tặng cho những bạn thật sự quan tâm đến việc thay đổi thói quen...',
      author: { name: "Minh Phương", role: "Chủ sách", timeAgo: "2 ngày trước" },
      book: { title: "Atomic Habits", rating: 4.8, pages: "2/5 suất" },
      stats: { likes: 45, comments: 23, views: 1200 },
      tags: ["thói quen", "phát triển bản thân", "kỹ năng"],
      isRegistered: false,
      comments: [
        {
          id: 1,
          author: "Tuấn Anh",
          text: "Cuốn này mình đọc 2 lần rồi, cực hay!",
          replies: [{ id: 11, author: "Lan Anh", text: "Chuẩn luôn bạn ơi!" }],
        },
      ],
    },
    {
      id: 2,
      type: "giveaway",
      title: 'Giveaway "Think and Grow Rich"',
      content:
        "Mình share 3 cuốn sách quý cho các bạn quan tâm phát triển tài chính.",
      author: { name: "Thu Hà", role: "Thành viên", timeAgo: "4 ngày trước" },
      book: { title: "Think and Grow Rich", rating: 4.6, pages: "0/3 suất" },
      stats: { likes: 28, comments: 15, views: 672 },
      tags: ["kinh doanh", "thành công", "tài chính"],
      isRegistered: true,
      comments: [],
    },
    {
      id: 3,
      type: "discussion",
      title: 'Bạn nào đã đọc "Deep Work" chưa?',
      content:
        "Mình nghe nhiều người recommend cuốn này, không biết có thực sự giúp tập trung làm việc sâu không?",
      author: { name: "Hoàng Nam", role: "Thành viên", timeAgo: "1 tuần trước" },
      book: { title: "Deep Work", rating: 4.7, pages: null },
      stats: { likes: 60, comments: 32, views: 2300 },
      tags: ["tập trung", "năng suất", "công việc"],
      isRegistered: false,
      comments: [],
    },
  ];

  const [posts, setPosts] = useState(samplePosts);

  const filteredPosts = posts.filter((post) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery) ||
      post.tags?.some((t) => t.toLowerCase().includes(normalizedQuery));
    switch (activeTab) {
      case "discuss":
        return post.type === "discussion" && matchesSearch;
      case "gift":
        return post.type === "giveaway" && matchesSearch;
      case "registered":
        return post.isRegistered && matchesSearch;
      case "hidden":
        return hiddenPosts.includes(post.id) && matchesSearch;
      default:
        return matchesSearch && !hiddenPosts.includes(post.id);
    }
  });

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const newLiked = new Set(prev);
      newLiked.has(postId) ? newLiked.delete(postId) : newLiked.add(postId);
      return newLiked;
    });
  };

  const handleQuickComment = (postId) => {
    if (!quickComments[postId]?.trim()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Date.now(),
                  author: "Bạn",
                  text: quickComments[postId],
                  replies: [],
                },
              ],
              stats: { ...p.stats, comments: p.stats.comments + 1 },
            }
          : p
      )
    );

    setQuickComments((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleHidePost = (id) => {
    setHiddenPosts((prev) => [...prev, id]);
    setDropdownPost(null);
  };

  const handleUnhidePost = (id) => {
    setHiddenPosts((prev) => prev.filter((pid) => pid !== id));
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDropdownPost(null);
  };

  const handleReport = (post) => {
    setReportPost(post);
    setDropdownPost(null);
  };

  const handleAddModalComment = () => {
    const text = modalCommentText.trim();
    if (!selectedPost || text.length === 0) return;
    setPosts((prev) => {
      const updated = prev.map((p) =>
        p.id === selectedPost.id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: Date.now(), author: "Bạn", text, replies: [] },
              ],
              stats: { ...p.stats, comments: p.stats.comments + 1 },
            }
          : p
      );
      const newSelected = updated.find((p) => p.id === selectedPost.id);
      setSelectedPost(newSelected || null);
      return updated;
    });
    setModalCommentText("");
  };

  const handleAddReply = (commentId) => {
    if (!selectedPost) return;
    const replyText = (modalReplyTexts[commentId] || "").trim();
    if (replyText.length === 0) return;
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== selectedPost.id) return p;
        const updatedComments = p.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), { id: Date.now(), author: "Bạn", text: replyText }] }
            : c
        );
        return { ...p, comments: updatedComments };
      });
      const newSelected = updated.find((p) => p.id === selectedPost.id);
      setSelectedPost(newSelected || null);
      return updated;
    });
    setModalReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
  };

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

  return (
    <div className="space-y-6">

      {/* Post List */}
      {filteredPosts.map((post) => (
        <div
          key={post.id}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors relative"
        >
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <RiUserLine className="text-slate-400" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{post.author.name}</h3>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {post.author.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <RiTimeLine size={14} />
                  <span>{post.author.timeAgo}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <div className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {getPostTypeIcon(post.type)}
                <span>{getPostTypeLabel(post.type)}</span>
              </div>
              {activeTab !== "hidden" && (
                <>
                  <button
                    className="text-slate-400 hover:text-white p-1"
                    onClick={() =>
                      setDropdownPost(dropdownPost === post.id ? null : post.id)
                    }
                  >
                    <RiMoreLine size={18} />
                  </button>

                  {/* Dropdown */}
                  {dropdownPost === post.id && (
                    <div className="absolute right-0 top-6 bg-slate-700 rounded shadow-md w-40 z-10">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleHidePost(post.id)}
                        className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white"
                      >
                        Ẩn
                      </button>
                      <button
                        onClick={() => handleReport(post)}
                        className="block w-full px-4 py-2 text-left hover:bg-slate-600 text-white"
                      >
                        Báo cáo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-3 leading-relaxed">
              {post.title}
            </h2>
            <p className="text-slate-300 leading-relaxed">{post.content}</p>
          </div>

          {/* Unhide button in hidden tab */}
          {activeTab === "hidden" && (
            <button
              onClick={() => handleUnhidePost(post.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white mb-4"
            >
              Khôi phục
            </button>
          )}

          {/* Book Info */}
          {post.book && (
            <div className="bg-slate-750 rounded-lg p-4 mb-4 border border-slate-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-slate-600 rounded-lg flex items-center justify-center">
                  <RiBookLine className="text-slate-400" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    {post.book.title}
                  </h4>
                  {post.book.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <RiStarLine className="text-yellow-500" size={16} />
                      <span className="text-sm text-slate-300">
                        {post.book.rating}
                      </span>
                    </div>
                  )}
                  {post.book.pages && (
                    <span className="text-sm bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      Còn {post.book.pages}
                    </span>
                  )}
                </div>
                {post.type === "giveaway" && (
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      post.isRegistered
                        ? "bg-green-600 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {post.isRegistered ? "Đã đăng ký" : "Đăng ký"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-6">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                {likedPosts.has(post.id) ? (
                  <RiHeartFill className="text-red-500" size={18} />
                ) : (
                  <RiHeartLine size={18} />
                )}
                <span className="text-sm">
                  {post.stats.likes + (likedPosts.has(post.id) ? 1 : 0)}
                </span>
              </button>

              <button
                onClick={() => setSelectedPost(post)}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <RiMessage3Line size={18} />
                <span className="text-sm">{post.stats.comments}</span>
              </button>

              <div className="flex items-center gap-2 text-slate-400">
                <RiEyeLine size={18} />
                <span className="text-sm">
                  {post.stats.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Comment Box */}
          <div className="mt-3 flex items-center gap-2">
            <input
              value={quickComments[post.id] || ""}
              onChange={(e) =>
                setQuickComments((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              placeholder="Viết bình luận..."
              className="flex-1 bg-slate-700 text-white rounded px-3 py-2 outline-none"
            />
            <button
              onClick={() => handleQuickComment(post.id)}
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
              {selectedPost.title}
            </h2>
            <p className="text-slate-300 mb-6">{selectedPost.content}</p>

            <h3 className="text-lg font-semibold text-white mb-4">Bình luận</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {selectedPost.comments.map((cmt) => (
                <div key={cmt.id} className="bg-slate-700 p-3 rounded">
                  <p className="text-white font-medium">{cmt.author}</p>
                  <p className="text-slate-300">{cmt.text}</p>
                  <div className="mt-2">
                    <button
                      className="text-xs text-slate-300 hover:text-white underline"
                      onClick={() =>
                        setOpenReplyBox((prev) => ({ ...prev, [cmt.id]: !prev[cmt.id] }))
                      }
                    >
                      Reply
                    </button>
                  </div>
                  {cmt.replies?.length > 0 && (
                    <div className="pl-4 mt-2 space-y-2 border-l border-slate-600">
                      {cmt.replies.map((rep) => (
                        <div key={rep.id}>
                          <p className="text-sm text-white font-medium">{rep.author}</p>
                          <p className="text-sm text-slate-300">{rep.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {openReplyBox[cmt.id] && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={modalReplyTexts[cmt.id] || ""}
                        onChange={(e) =>
                          setModalReplyTexts((prev) => ({ ...prev, [cmt.id]: e.target.value }))
                        }
                        placeholder="Trả lời bình luận..."
                        className="flex-1 bg-slate-600 text-white rounded px-3 py-2 outline-none"
                      />
                      <button
                        onClick={() => handleAddReply(cmt.id)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded text-white text-sm"
                      >
                        Trả lời
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 w-full max-w-md rounded-lg p-6 relative">
            <button
              onClick={() => setReportPost(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <RiCloseLine size={24} />
            </button>

            <h2 className="text-lg font-bold text-white mb-3">Báo cáo bài viết</h2>
            <p className="text-slate-300 mb-3">{reportPost.title}</p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full bg-slate-700 text-white rounded p-2 mb-4"
              rows="4"
              placeholder="Nhập lý do báo cáo..."
            ></textarea>
            <button
              onClick={() => {
                alert("Báo cáo đã được gửi!");
                setReportPost(null);
                setReportText("");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
            >
              Gửi báo cáo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
