import React, { useState, useEffect } from "react";
import HomePageImage1 from "../../assets/HomePageImage1.jpg";
import HomePageImage2 from "../../assets/HomePageImage2.jpg";

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [HomePageImage1, HomePageImage2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 giây

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background images with transition */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
      </div>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-8 py-12">
        <div className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6 inline-block">
          NGHE THỬ MIỄN PHÍ, KHÔNG GIỚI HẠN SÁCH MỖI THÁNG
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Nghe thử miễn phí, không giới hạn sách mỗi tháng
        </h1>

        <p className="text-lg text-gray-200 mb-4">
          Ứng dụng sách nói hàng đầu Việt Nam, với kho Sách nói Bản quyền Chất
          lượng cao, Bán chạy nhất.
        </p>

        <p className="text-lg text-gray-200 mb-8">
          Với  Nhiều nội dung kiến
          thức đa dạng: <span className="font-bold text-white">Sách nói, Truyện nói.</span>
        </p>

        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors whitespace-nowrap">
          VỚI CHƯƠNG TRÌNH TẶNG SÁCH SIÊU HẤP DẪN.
        </button>
      </div>
    </div>
  );
}
