'use client';

import { Link } from "react-router-dom";
import { FaStar, FaRegStar } from 'react-icons/fa';

export default function BookRelated({ currentBookId, category }) {
  const relatedBooks = [
    {
      id: 2,
      title: 'Hạnh Phúc Đích Thực',
      author: 'Martin Seligman',
      category: 'Tâm lý học',
      rating: 4.5,
      price: 85000,
      image: 'https://bizweb.dktcdn.net/100/180/408/products/0f1167f115d3462689fa46f6c120d3b1-fb196e72-1f32-47d3-b1f7-5e13ef8ca498.jpg?v=1615803844217',
    },
    {
      id: 3,
      title: 'Tư Duy Nhanh Và Chậm',
      author: 'Daniel Kahneman',
      category: 'Tâm lý học',
      rating: 4.7,
      price: 95000,
      image: 'https://readdy.ai/api/search-image?query=Psychology%20thinking%20decision-making%20book%20cover%20brain%20cognitive%20science%20mind%20modern%20minimalist%20design%20blue%20orange%20colors%20academic%20professional%20layout&width=200&height=280&seq=related2&orientation=portrait',
    },
    {
      id: 4,
      title: 'Nghệ Thuật Sống Hạnh Phúc',
      author: 'Thích Nhất Hạnh',
      category: 'Tâm lý học',
      rating: 4.8,
      price: 75000,
      image: 'https://readdy.ai/api/search-image?query=Buddhism%20mindfulness%20happiness%20spiritual%20wisdom%20book%20cover%20peaceful%20zen%20meditation%20nature%20lotus%20flowers%20calming%20green%20blue%20tones%20traditional%20Eastern%20philosophy%20design&width=200&height=280&seq=related3&orientation=portrait',
    },
  ].filter((book) => book.id !== currentBookId && book.category === category);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Sách cùng thể loại</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedBooks.length > 0 ? (
          relatedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group"
            >
              <Link to={`/bookdetails/${book.id}`} className="block">
                <div className="relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{book.author}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) =>
                          i < Math.floor(book.rating) ? (
                            <FaStar key={i} className="text-yellow-400 text-xs" />
                          ) : (
                            <FaRegStar key={i} className="text-yellow-400 text-xs" />
                          )
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{book.rating}</span>
                    </div>
                    <span className="text-orange-400 font-semibold text-sm">
                      {book.price.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Không có sách liên quan.</p>
        )}
      </div>
    </section>
  );
}
