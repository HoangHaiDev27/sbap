'use client';
import { useState, useEffect } from 'react';
import { getPendingPosts, approvePost, rejectPost } from '../../api/postApi';
import { RiEyeLine, RiCheckLine, RiCloseLine, RiMessage3Line, RiGiftLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function PendingPostsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionPost, setActionPost] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      const data = await getPendingPosts();
      const postsArray = Array.isArray(data) ? data : (data?.data || []);
      setPosts(postsArray);
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải danh sách bài đăng chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleApprove = async (post) => {
    try {
      await approvePost(post.postId);
      toast.success('Đã duyệt bài đăng');
      setPosts(prev => prev.filter(p => p.postId !== post.postId));
      setActionType(null);
      setActionPost(null);
    } catch (err) {
      toast.error(err.message || 'Không thể duyệt bài đăng');
    }
  };

  const handleReject = async (post) => {
    try {
      await rejectPost(post.postId);
      toast.success('Đã từ chối bài đăng');
      setPosts(prev => prev.filter(p => p.postId !== post.postId));
      setActionType(null);
      setActionPost(null);
    } catch (err) {
      toast.error(err.message || 'Không thể từ chối bài đăng');
    }
  };

  const handleActionClick = (type, post) => {
    setActionType(type);
    setActionPost(post);
  };

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

  const getPostTypeIcon = (type) => {
    switch (type) {
      case "giveaway":
        return <RiGiftLine className="text-green-500" size={18} />;
      case "discuss":
        return <RiMessage3Line className="text-blue-500" size={18} />;
      default:
        return <RiMessage3Line className="text-gray-500" size={18} />;
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case "giveaway":
        return "Tặng sách";
      case "discuss":
        return "Thảo luận";
      default:
        return "Thảo luận";
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-24">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Duyệt bài đăng</h2>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">STT</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Bài đăng</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tác giả</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Loại</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedPosts.map((post, index) => (
                    <tr key={post.postId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{post.title || "Không có tiêu đề"}</p>
                          <p className="text-gray-600 text-sm line-clamp-1">{post.content || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {post.author?.fullName || post.author?.email || "Người dùng"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          {getPostTypeIcon(post.postType)}
                          <span>{getPostTypeLabel(post.postType)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{getTimeAgo(post.createdAt)}</td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          title="Xem chi tiết"
                          onClick={() => handleViewDetails(post)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <RiEyeLine size={18} />
                        </button>
                        <button
                          title="Duyệt bài"
                          onClick={() => handleApprove(post)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        >
                          <RiCheckLine size={18} />
                        </button>
                        <button
                          title="Từ chối bài"
                          onClick={() => handleReject(post)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <RiCloseLine size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPosts.length === 0 && (
                <p className="p-4 text-center text-gray-500">Không có bài đăng nào chờ duyệt</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <p className="text-sm text-gray-600">
                  Trang {currentPage}/{totalPages}
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPost.title || "Không có tiêu đề"}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Tác giả: {selectedPost.author?.fullName || selectedPost.author?.email || "Người dùng"}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Loại: {getPostTypeLabel(selectedPost.postType)}
                </p>
                <p className="text-sm text-gray-600">
                  Thời gian: {getTimeAgo(selectedPost.createdAt)}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content || ""}</p>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {selectedPost.attachments
                    .filter(att => att.fileType === "Image" || att.fileType === "image" || !att.fileType)
                    .map((attachment, index) => (
                      <img
                        key={attachment.attachmentId || index}
                        src={attachment.fileUrl}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-auto max-h-96 object-contain rounded-lg border"
                      />
                    ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleApprove(selectedPost);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Duyệt bài
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedPost);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

