'use client';

import { Link } from "react-router-dom";
import {
  RiGridLine,
  RiListCheck,
  RiBookLine,
  RiHeadphoneLine,
  RiStarFill,
  RiStarLine,
  RiHeartLine,
} from 'react-icons/ri';

export default function BookGrid({ selectedCategory, selectedFormat}) {
  const books = [
    {
      id: 1,
      title: 'Đắc Nhân Tâm',
      author: 'Dale Carnegie',
      category: 'Tâm lý học',
      format: ['Sách điện tử', 'Sách nói'],
      rating: 4.8,
      reviews: 1205,
      price: 89000,
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20book%20cover%20%C4%90%E1%BA%AFc%20Nh%C3%A2n%20T%C3%A2m%20Dale%20Carnegie%20psychology%20self-help%20book%20with%20warm%20orange%20and%20gold%20tones%20minimalist%20design%20professional%20layout%20clean%20background%20modern%20typography&width=200&height=280&seq=book1&orientation=portrait',
      description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ảnh hưởng đến người khác.',
      duration: '7h 30m'
    },
    {
      id: 2,
      title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
      author: 'Nguyễn Nhật Ánh',
      category: 'Văn học',
      format: ['Sách điện tử', 'Sách nói'],
      rating: 4.9,
      reviews: 2150,
      price: 75000,
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20literature%20book%20cover%20yellow%20flowers%20green%20grass%20rural%20countryside%20nostalgic%20childhood%20memories%20warm%20earth%20tones%20simple%20elegant%20design%20traditional%20Vietnamese%20aesthetics&width=200&height=280&seq=book2&orientation=portrait',
      description: 'Tác phẩm văn học đầy cảm xúc về tuổi thơ và tình bạn.',
      duration: '6h 15m'
    },
    {
      id: 3,
      title: 'Khởi Nghiệp Tinh Gọn',
      author: 'Eric Ries',
      category: 'Kinh doanh',
      format: ['Sách điện tử'],
      rating: 4.7,
      reviews: 890,
      price: 120000,
      image: 'https://readdy.ai/api/search-image?query=Business%20startup%20book%20cover%20modern%20minimalist%20design%20blue%20and%20orange%20corporate%20colors%20clean%20geometric%20shapes%20professional%20layout%20entrepreneurship%20innovation%20technology%20theme&width=200&height=280&seq=book3&orientation=portrait',
      description: 'Phương pháp khởi nghiệp hiệu quả trong thời đại số.',
      duration: '8h 45m'
    },
    {
      id: 4,
      title: 'Sherlock Holmes: Cuộc Phiêu Lưu',
      author: 'Arthur Conan Doyle',
      category: 'Trinh thám',
      format: ['Sách điện tử', 'Sách nói'],
      rating: 4.8,
      reviews: 1650,
      price: 95000,
      image: 'https://readdy.ai/api/search-image?query=Detective%20mystery%20book%20cover%20Victorian%20era%20London%20foggy%20streets%20dark%20atmosphere%20Sherlock%20Holmes%20vintage%20magnifying%20glass%20classic%20detective%20fiction%20elegant%20typography%20noir%20style&width=200&height=280&seq=book4&orientation=portrait',
      description: 'Tuyển tập những vụ án kinh điển của thám tử nổi tiếng.',
      duration: '12h 20m'
    },
    {
      id: 5,
      title: 'Lược Sử Thời Gian',
      author: 'Stephen Hawking',
      category: 'Khoa học',
      format: ['Sách điện tử', 'Sách nói'],
      rating: 4.6,
      reviews: 750,
      price: 110000,
      image: 'https://readdy.ai/api/search-image?query=Science%20physics%20book%20cover%20cosmic%20universe%20stars%20galaxies%20space%20time%20relativity%20Stephen%20Hawking%20dark%20blue%20purple%20cosmic%20colors%20scientific%20illustration%20modern%20academic%20design&width=200&height=280&seq=book5&orientation=portrait',
      description: 'Khám phá những bí ẩn của vũ trụ và thời gian.',
      duration: '9h 10m'
    },
    {
      id: 6,
      title: 'Hạnh Phúc Đích Thực',
      author: 'Martin Seligman',
      category: 'Tâm lý học',
      format: ['Sách nói'],
      rating: 4.5,
      reviews: 620,
      price: 85000,
      image: 'https://readdy.ai/api/search-image?query=Psychology%20happiness%20wellness%20book%20cover%20bright%20cheerful%20colors%20sunrise%20sunset%20peaceful%20meditation%20mindfulness%20positive%20psychology%20warm%20golden%20orange%20tones%20uplifting%20design&width=200&height=280&seq=book6&orientation=portrait',
      description: 'Con đường tìm kiếm hạnh phúc thật sự trong cuộc sống.',
      duration: '7h 55m'
    },
    {
      id: 7,
      title: 'Chiến Tranh Thế Giới Thứ II',
      author: 'Antony Beevor',
      category: 'Lịch sử',
      format: ['Sách điện tử'],
      rating: 4.7,
      reviews: 980,
      price: 135000,
      image: 'https://readdy.ai/api/search-image?query=World%20War%20II%20history%20book%20cover%20vintage%20military%20historical%20documentary%20style%20sepia%20brown%20tones%20old%20photographs%20maps%20serious%20academic%20design%20wartime%20atmosphere&width=200&height=280&seq=book7&orientation=portrait',
      description: 'Cái nhìn toàn diện về cuộc chiến tranh lớn nhất lịch sử.',
      duration: '15h 30m'
    },
    {
      id: 8,
      title: 'Tình Yêu Thời Cholera',
      author: 'Gabriel García Márquez',
      category: 'Lãng mạn',
      format: ['Sách điện tử', 'Sách nói'],
      rating: 4.9,
      reviews: 1850,
      price: 98000,
      image: 'https://readdy.ai/api/search-image?query=Romantic%20literature%20book%20cover%20passionate%20love%20story%20Latin%20American%20magical%20realism%20warm%20red%20pink%20colors%20roses%20cholera%20epidemic%20vintage%20romantic%20artistic%20elegant%20design&width=200&height=280&seq=book8&orientation=portrait',
      description: 'Tác phẩm bất hủ về tình yêu vượt thời gian.',
      duration: '14h 20m'
    }
  ];

  const filteredBooks = books.filter(book => {
    if (selectedCategory !== 'Tất cả' && book.category !== selectedCategory) return false;
    if (selectedFormat !== 'Tất cả') {
      if (selectedFormat === 'Sách điện tử' && !book.format.includes('Sách điện tử')) return false;
      if (selectedFormat === 'Sách nói' && !book.format.includes('Sách nói')) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">
          Hiển thị {filteredBooks.length} kết quả
        </p>
        <div className="flex space-x-2">
          <button className="p-2 bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
            <RiGridLine className="w-5 h-5" />
          </button>
          <button className="p-2 bg-gray-700 rounded-md text-white">
            <RiListCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group cursor-pointer"
          >
            <Link href={`/bookdetails/${book.id}`} className="block">
              <div className="relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <div className="flex space-x-1">
                    {book.format.includes('Sách điện tử') && (
                      <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
                        <RiBookLine className="w-3 h-3" />
                      </span>
                    )}
                    {book.format.includes('Sách nói') && (
                      <span className="bg-green-600 text-xs px-2 py-1 rounded-full">
                        <RiHeadphoneLine className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">{book.author}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) =>
                      i < Math.floor(book.rating) ? (
                        <RiStarFill key={i} className="text-yellow-400 text-xs" />
                      ) : (
                        <RiStarLine key={i} className="text-yellow-400 text-xs" />
                      )
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {book.rating} ({book.reviews})
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {book.description}
                </p>

                {/* Price + Duration + Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400 font-semibold">
                      {book.price.toLocaleString()}đ
                    </span>
                    {book.format.includes('Sách nói') && (
                      <span className="text-xs text-gray-400">
                        {book.duration}
                      </span>
                    )}
                  </div>
                  <button className="text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap">
                    <RiHeartLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <RiBookLine className="text-6xl text-gray-600 mb-4 w-24 h-24 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Không tìm thấy sách</h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}
    </div>
  );
}
