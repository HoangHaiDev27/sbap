import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function BookCarousel({ title, books, hasCategories, categories }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link
          to="/audiobooks"
          className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer whitespace-nowrap flex items-center"
        >
          Xem thêm <span className="ml-1">➔</span>
        </Link>
      </div>

      {/* Categories */}
      {hasCategories && categories && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Books */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {books.map((book) => (
          <Link
            key={book.id}
            to={`/bookdetails/${book.id}`}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className="min-w-[10rem] w-40">
              <div className="relative mb-3">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-56 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg"></div>
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
