import React, { useState } from 'react';

export default function VipPackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Inline SVG Icons
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 
      1.402 8.168L12 18.896l-7.336 3.864 
      1.402-8.168L.132 9.21l8.2-1.192z"/>
    </svg>
  );

  const icons = {
    Download: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
      </svg>
    ),
    Users: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H3v-2a4 4 0 014-4h1m6-6a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    ),
    Zap: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    Shield: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    Headphones: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 18a3 3 0 11-6 0v-6a3 3 0 016 0v6zM3 18a3 3 0 106 0v-6a3 3 0 00-6 0v6z"/>
      </svg>
    ),
    Clock: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"/>
      </svg>
    )
  };

  const packages = [
    {
      id: 'basic',
      name: 'Gói cơ bản',
      price: '29.000đ/tháng',
      originalPrice: '39.000đ',
      discount: '25% OFF',
      features: ['Nghe không giới hạn','Chất lượng âm thanh cao','Tải xuống offline','Không quảng cáo','Hỗ trợ 24/7'],
      popular: false
    },
    {
      id: 'premium',
      name: 'Gói tháng',
      price: '59.000đ/tháng',
      originalPrice: '79.000đ',
      discount: '25% OFF',
      features: ['Tất cả tính năng gói cơ bản','Chất lượng âm thanh lossless','Tải xuống không giới hạn','Nghe cùng lúc 3 thiết bị','Playlist cá nhân hóa','Ưu tiên hỗ trợ'],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Gói năm',
      price: '499.000đ/năm',
      originalPrice: '699.000đ',
      discount: '29% OFF',
      features: ['Tất cả tính năng gói tháng','Tiết kiệm 2 tháng','Ưu tiên cập nhật tính năng mới','Tặng kèm ebook miễn phí','Hỗ trợ VIP 24/7','Backup dữ liệu cloud'],
      popular: false
    }
  ];

  const benefits = [
    { icon: icons.Download, title: 'Tải sách đang nghe', description: 'Tải xuống và nghe offline mọi lúc mọi nơi' },
    { icon: icons.Users, title: 'Ít người sử dụng', description: 'Trải nghiệm mượt mà với ít người dùng đồng thời' },
    { icon: icons.Zap, title: 'Tốc độ nhanh', description: 'Tốc độ tải và phát nhanh chóng' },
    { icon: icons.Shield, title: 'Chất lượng tốt nhất', description: 'Âm thanh chất lượng cao, không mất dữ liệu' },
    { icon: icons.Headphones, title: 'Cách âm thanh', description: 'Công nghệ khử tiếng ồn tiên tiến' },
    { icon: icons.Clock, title: 'Có thể 24/7', description: 'Hỗ trợ và truy cập 24 giờ mỗi ngày' }
  ];

  const audioSamples = [
    { title: 'Facebook', category: 'Kinh doanh' },
    { title: 'Accounting Tutorial', category: 'Giáo dục' },
    { title: 'Science', category: 'Khoa học' },
    { title: 'BOOK', category: 'Sách nói' }
  ];

  const faqs = [
    { question: 'Gói có triết khấu cho sinh viên không?', answer: 'Có, chúng tôi cung cấp giảm giá 50% cho sinh viên có thẻ sinh viên hợp lệ.' },
    { question: 'Cách nâng cấp lên Premium mới nhất?', answer: 'Bạn có thể nâng cấp bất cứ lúc nào thông qua trang cài đặt tài khoản hoặc liên hệ hỗ trợ.' },
    { question: 'Có thể dùng trên tất cả thiết bị không?', answer: 'Có, gói Premium cho phép sử dụng trên tất cả thiết bị và đồng bộ dữ liệu.' },
    { question: 'Làm thế nào để sử dụng nhiều tài khoản?', answer: 'Gói gia đình cho phép tạo tối đa 6 tài khoản con với các tính năng đầy đủ.' },
    { question: 'Có thể tải về máy để nghe offline không?', answer: 'Có, tất cả các gói trả phí đều hỗ trợ tải xuống và nghe offline không giới hạn.' },
    { question: 'Có bị giới hạn gì không?', answer: 'Gói Premium không có giới hạn về số lượng sách, thời gian nghe hay số lần tải xuống.' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Gói chuyển file sang audio</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu của bạn và trải nghiệm những tính năng tuyệt vời
          </p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg) => (
            <div key={pkg.id}
              className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                pkg.popular ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-50' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <StarIcon /> Phổ biến nhất
                  </div>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-gray-400 line-through text-lg">{pkg.originalPrice}</span>
                  <div className="text-3xl font-bold text-orange-500">{pkg.price}</div>
                  <span className="text-sm text-green-400 font-medium">{pkg.discount}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start"><CheckIcon /> <span className="text-gray-300">{f}</span></li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
                  pkg.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                Chọn gói này
              </button>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn dịch vụ của chúng tôi?</h2>
            <p className="text-gray-400">Những lợi ích tuyệt vời khi sử dụng gói VIP</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-750 transition-colors duration-200">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {b.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
                <p className="text-gray-400">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Samples */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mẫu Audio Demo</h2>
            <p className="text-gray-400">Trải nghiệm chất lượng âm thanh tuyệt vời</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audioSamples.map((s, i) => (
              <div key={i} className="bg-gray-800 rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg relative">
                  {s.title}
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"/>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-400">{s.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-400">Giải đáp những thắc mắc của bạn</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="mb-4">
                <button
                  className="w-full bg-gray-800 rounded-lg p-6 text-left hover:bg-gray-750 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    <div className={`transform transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                  {expandedFaq === i && <div className="mt-4 text-gray-400">{faq.answer}</div>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
