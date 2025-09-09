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
} from "react-icons/ri";

export default function PostList({ activeTab, searchQuery }) {
  const [likedPosts, setLikedPosts] = useState(new Set());

  const samplePosts = [
    {
      id: 1,
      type: "discussion",
      title: 'Tặng 5 cuốn "Atomic Habits" - Thay đổi tí hon, hiệu quả bất ngờ?',
      content: 'Mình có 5 cuốn "Atomic Habits" muốn tặng cho những bạn thật sự quan tâm đến việc xây dựng thói quen tích cực. Cuốn sách này đã thay đổi hoàn toàn cách mình nhìn nhận về việc phát triển bản thân. Nếu bạn đang muốn thay đổi cuộc sống của mình từ những việc nhỏ nhặt...',
      author: {
        name: "Minh Phương",
        role: "Chủ sách",
        avatar: null,
        timeAgo: "602 ngày trước"
      },
      book: {
        title: "Atomic Habits",
        cover: null,
        rating: 4.8,
        pages: "2/5 suất"
      },
      stats: {
        likes: 45,
        comments: 23,
        views: 1200
      },
      tags: ["thói quen", "phát triển bản thân", "kỹ năng"],
      isRegistered: false
    },
    {
      id: 2,
      type: "discussion",
      title: 'Chia sẻ cảm nhận về "Sapiens" - Cuốn sách thay đổi cách nhìn về lịch sử',
      content: 'Vừa đọc xong "Sapiens" của Yuval Noah Harari và mình thật sự bị choáng ngợp bởi cách tác giả kể về lịch sử loài người. Từ thời tiền sử đến cuộc cách mạng nông nghiệp và công nghiệp, mọi thứ đều được giải thích một cách logic và dễ hiểu. Các bạn đã đọc chưa?...',
      author: {
        name: "Tuấn Anh",
        role: "Thành viên",
        avatar: null,
        timeAgo: "602 ngày trước"
      },
      book: {
        title: "Sapiens",
        cover: null
      },
      stats: {
        likes: 32,
        comments: 18,
        views: 890
      },
      tags: ["lịch sử", "khoa học", "triết học"],
      isRegistered: false
    },
    {
      id: 3,
      type: "giveaway",
      title: 'Giveaway "Think and Grow Rich" - Bí quyết thành công từ Napoleon Hill',
      content: 'Napoleon Hill đã dành 20 năm nghiên cứu 500 triệu phú để viết nên cuốn sách này. Mình muốn chia sẻ 3 cuốn "Think and Grow Rich" cho những bạn đang khát khao thành công trong kinh doanh và cuộc sống. Đây không chỉ là sách về làm giàu mà còn là triết lý sống.',
      author: {
        name: "Thu Hà",
        role: "Thành viên",
        avatar: null,
        timeAgo: "604 ngày trước"
      },
      book: {
        title: "Think and Grow Rich",
        cover: null,
        rating: 4.6,
        pages: "0/3 suất"
      },
      stats: {
        likes: 28,
        comments: 15,
        views: 672
      },
      tags: ["kinh doanh", "thành công", "tài chính"],
      isRegistered: true
    },
    {
      id: 4,
      type: "question",
      title: "Sách nào giúp bạn vượt qua giai đoạn khó khăn trong cuộc sống?",
      content: 'Mình đang trải qua một giai đoạn khá khó khăn và cần tìm những cuốn sách có thể giúp mình có động lực và cách nhìn tích cực hơn. Các bạn có thể gợi ý một số cuốn sách đã giúp bạn vượt qua những thời điểm khó khăn tương tự không? Cảm ơn mọi người rất nhiều!',
      author: {
        name: "Lan Anh",
        role: "Thành viên",
        avatar: null,
        timeAgo: "604 ngày trước"
      },
      stats: {
        likes: 56,
        comments: 34,
        views: 1450
      },
      tags: ["tâm lý", "động lực", "tích cực"],
      isRegistered: false
    },
    {
      id: 5,
      type: "giveaway",
      title: 'Review "Dạy con làm giàu" - Robert Kiyosaki có phù hợp với người Việt?',
      content: 'Vừa đọc xong "Rich Dad Poor Dad" và cảm thấy nhiều quan điểm khá mới mẻ về tiền bạc và đầu tư. Tuy nhiên mình hơi phân vân về mức độ phù hợp với bối cảnh kinh tế Việt Nam hiện tại. Không biết những lời khuyên trong cuốn sách này có phù hợp với bối cảnh kinh tế Việt Nam không. Các bạn nghĩ sao về cuốn sách này?',
      author: {
        name: "Hoàng Nam",
        role: "Thành viên",
        avatar: null,
        timeAgo: "606 ngày trước"
      },
      stats: {
        likes: 25,
        comments: 12,
        views: 543
      },
      tags: ["tài chính", "đầu tư", "giáo dục"],
      isRegistered: false
    }
  ];

  const filteredPosts = samplePosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case "discuss":
        return post.type === "discussion" && matchesSearch;
      case "gift":
        return post.type === "giveaway" && matchesSearch;
      case "registered":
        return post.isRegistered && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
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
      {filteredPosts.map((post) => (
        <div key={post.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
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
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {getPostTypeIcon(post.type)}
                <span>{getPostTypeLabel(post.type)}</span>
              </div>
              <button className="text-slate-400 hover:text-white p-1">
                <RiMoreLine size={18} />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-3 leading-relaxed">
              {post.title}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Book Info (if giveaway) */}
          {post.book && (
            <div className="bg-slate-750 rounded-lg p-4 mb-4 border border-slate-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-slate-600 rounded-lg flex items-center justify-center">
                  <RiBookLine className="text-slate-400" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{post.book.title}</h4>
                  {post.book.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <RiStarLine className="text-yellow-500" size={16} />
                      <span className="text-sm text-slate-300">{post.book.rating}</span>
                    </div>
                  )}
                  {post.book.pages && (
                    <span className="text-sm bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      Còn {post.book.pages}
                    </span>
                  )}
                </div>
                {post.type === "giveaway" && (
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    post.isRegistered
                      ? "bg-green-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}>
                    {post.isRegistered ? "Đã đăng ký" : "Đăng ký"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
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

              <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                <RiMessage3Line size={18} />
                <span className="text-sm">{post.stats.comments}</span>
              </button>

              <div className="flex items-center gap-2 text-slate-400">
                <RiEyeLine size={18} />
                <span className="text-sm">{post.stats.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <RiBookLine className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">Không tìm thấy bài viết nào</p>
        </div>
      )}
    </div>
  );
}