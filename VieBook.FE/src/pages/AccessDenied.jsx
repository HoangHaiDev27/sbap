import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiShieldCrossLine, RiHomeLine, RiArrowLeftLine } from 'react-icons/ri';

export default function AccessDenied() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
            <RiShieldCrossLine className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Truy cập bị từ chối
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Xin lỗi, bạn không có quyền truy cập vào trang này. 
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2"
          >
            <RiHomeLine className="w-5 h-5" />
            <span>Về trang chủ</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2"
          >
            <RiArrowLeftLine className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Nếu bạn cần hỗ trợ, vui lòng liên hệ{' '}
            <a 
              href="mailto:support@viebook.com" 
              className="text-orange-500 hover:text-orange-400 underline"
            >
              support@viebook.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
