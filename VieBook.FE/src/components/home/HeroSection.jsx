import React from "react";

export default function HeroSection() {
  return (
    <div
      className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center"
      style={{
        backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern%20digital%20reading%20platform%20with%20floating%20books%20and%20tablets%20in%20a%20minimalist%20blue%20gradient%20background%2C%20soft%20lighting%2C%20technology%20concept%2C%20clean%20design%20aesthetic&width=1200&height=600&seq=hero1&orientation=landscape)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 sm:px-8 py-12">
        <div className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 inline-block">
          NGHE THỬ MIỄN PHÍ, KHÔNG GIỚI HẠN SÁCH MỖI THÁNG
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Nghe thử miễn phí, không giới hạn sách mỗi tháng
        </h1>

        <p className="text-base sm:text-lg text-gray-200 mb-4">
          Ứng dụng sách nói hàng đầu Việt Nam, với kho Sách nói Bản quyền Chất
          lượng cao, Bán chạy nhất.
        </p>

        <p className="text-base sm:text-lg text-gray-200 mb-8">
          Hơn <span className="font-bold text-white">15,000</span> nội dung kiến
          thức đa dạng: Sách nói, Podcast, Sách tóm tắt, Thiền, Học tiếng Anh.
        </p>

        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full text-sm sm:text-lg transition-colors whitespace-nowrap">
          TẢI NGAY
        </button>
      </div>
    </div>
  );
}
