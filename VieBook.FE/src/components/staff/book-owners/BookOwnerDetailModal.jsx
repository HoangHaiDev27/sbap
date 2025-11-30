import React, { useState, useEffect } from "react";
import { FaRegCircle, FaCrown, FaCoins, FaPhone, FaCalendarAlt, FaClock } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { getUserSubscription } from "../../../api/userManagementApi";

export default function BookOwnerDetailModal({
  owner,
  onClose,
}) {
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const data = await getUserSubscription(owner.userId);
        setSubscription(data);
      } catch (err) {
        console.warn('Failed to load subscription:', err);
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    if (owner.userId) {
      loadSubscription();
    }
  }, [owner.userId]);

  const renderVipBadge = () => {
    if (loadingSubscription) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
          Đang tải...
        </div>
      );
    }

    if (subscription && subscription.status === 'Active') {
      const planId = subscription.planId || subscription.plan?.planId;
      const planName = subscription.plan?.name || subscription.planName;
      
      switch (planId) {
        case 1:
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
              <FaCrown className="mr-1 text-yellow-500" /> Reader Plus
            </span>
          );
        case 2:
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
              <FaCrown className="mr-1 text-purple-500" /> Owner Pro
            </span>
          );
        default:
          if (planName) {
            return (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                <FaCrown className="mr-1 text-blue-500" /> {planName}
              </span>
            );
          }
      }
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
        <FaRegCircle className="mr-1" /> None
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết chủ sách
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="flex items-center space-x-4 mb-6">
          {owner.avatarUrl ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={owner.avatarUrl}
              alt={owner.fullName}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <i className="ri-user-line text-gray-600 text-2xl"></i>
            </div>
          )}
          <div>
            <h4 className="text-lg font-medium text-gray-900">{owner.fullName || 'Chưa cập nhật'}</h4>
            <div className="mt-1 text-sm text-gray-600">
              📧 {owner.email}
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 flex items-center mb-1">
              <i className="ri-book-2-line mr-1"></i> Số sách đã đăng
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {owner.bookCount || 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 flex items-center mb-1">
              <i className="ri-shopping-cart-line mr-1"></i> Số chương đã bán
            </div>
            <div className="text-2xl font-bold text-green-900">
              {owner.orderCount || 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 flex items-center mb-1">
              <FaCoins className="mr-1" /> Số dư ví
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {(owner.wallet || 0).toLocaleString()} xu
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 flex items-center mb-1">
              <FaCrown className="mr-1" /> Gói VIP
            </div>
            <div className="mt-2">
              {renderVipBadge()}
            </div>
          </div>
        </div>

        {/* Thông tin thêm */}
        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600 flex items-center">
              <FaPhone className="mr-2" /> Số điện thoại
            </span>
            <span className="text-sm font-medium text-gray-900">
              {owner.phone || 'Chưa cập nhật'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600 flex items-center">
              <FaCalendarAlt className="mr-2" /> Ngày tạo tài khoản
            </span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(owner.createdAt).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600 flex items-center">
              <FaClock className="mr-2" /> Đăng nhập lần cuối
            </span>
            <span className="text-sm font-medium text-gray-900">
              {owner.lastLoginAt 
                ? new Date(owner.lastLoginAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Chưa có'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600 flex items-center">
              <i className="ri-shield-check-line mr-2"></i> Trạng thái tài khoản
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                owner.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {owner.status === "Active" ? "Hoạt động" : "Bị khóa"}
            </span>
          </div>
        </div>

        {/* Subscription details */}
        {subscription && subscription.status === 'Active' && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 mb-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center">
              <FaCrown className="mr-2 text-amber-600" /> Thông tin gói VIP
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">Gói:</span>
                <span className="font-medium text-amber-900">{subscription.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Bắt đầu:</span>
                <span className="font-medium text-amber-900">
                  {new Date(subscription.startAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Kết thúc:</span>
                <span className="font-medium text-amber-900">
                  {new Date(subscription.endAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {subscription.remainingConversions !== null && (
                <div className="flex justify-between">
                  <span className="text-amber-700">Lượt chuyển đổi còn lại:</span>
                  <span className="font-medium text-amber-900">
                    {subscription.remainingConversions}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-amber-700">Tự động gia hạn:</span>
                <span className="font-medium text-amber-900">
                  {subscription.autoRenew ? 'Có' : 'Không'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
