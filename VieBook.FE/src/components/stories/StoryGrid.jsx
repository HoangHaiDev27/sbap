'use client';

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RiHeadphoneLine,
  RiTimeLine,
  RiListCheck,
  RiStarFill,
  RiPlayFill,
} from "react-icons/ri";

const stories = [
  {
    id: 1,
    title: "Chuyện tình cô gái bán hoa",
    author: "Nguyễn Nhật Ánh",
    narrator: "Thanh Hương",
    genre: "Tình cảm",
    duration: "2h 30m",
    chapters: 8,
    rating: 4.8,
    coverImage:
      "https://readdy.ai/api/search-image?query=Beautiful%20Vietnamese%20girl%20selling%20flowers%20in%20the%20market%2C%20romantic%20love%20story%20book%20cover%20with%20soft%20lighting%20and%20floral%20background%2C%20gentle%20pastel%20colors%2C%20warm%20atmosphere&width=300&height=400&seq=story1&orientation=portrait",
  },
  {
    id: 2,
    title: "Kỳ án Sherlock Holmes - Chó săn vùng Baskerville",
    author: "Arthur Conan Doyle",
    narrator: "Minh Châu",
    genre: "Trinh thám",
    duration: "4h 15m",
    chapters: 12,
    rating: 4.9,
    coverImage:
      "https://readdy.ai/api/search-image?query=Mysterious%20detective%20story%20with%20Sherlock%20Holmes%20silhouette%2C%20dark%20Victorian%20London%20atmosphere%2C%20foggy%20streets%20and%20vintage%20detective%20elements%2C%20classic%20mystery%20book%20cover%20design&width=300&height=400&seq=story2&orientation=portrait",
  },
  {
    id: 3,
    title: "Ma Lai ở căn nhà số 13",
    author: "Lý Hoàng Long",
    narrator: "Hoàng Anh",
    genre: "Kinh dị",
    duration: "3h 45m",
    chapters: 10,
    rating: 4.6,
    coverImage:
      "https://readdy.ai/api/search-image?query=Scary%20haunted%20house%20number%2013%20in%20dark%20night%2C%20horror%20story%20atmosphere%20with%20mysterious%20shadows%20and%20eerie%20lighting%2C%20Vietnamese%20ghost%20story%20book%20cover%20with%20spooky%20elements&width=300&height=400&seq=story3&orientation=portrait",
  },
  // 👉 thêm nhiều story để test
];

export default function StoryGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(stories.length / itemsPerPage);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStories = stories.slice(indexOfFirst, indexOfLast);

  return (
    <div>
      {/* Grid stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentStories.map((story) => (
          <div
            key={story.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors"
          >
            <Link to={`/player/${story.id}`}>
              <div className="relative">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-64 object-cover object-top"
                />
                {/* Genre Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {story.genre}
                  </span>
                </div>
                {/* Headphone Icon */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/50 rounded-full p-2">
                    <RiHeadphoneLine className="text-white text-sm" />
                  </div>
                </div>
                {/* Duration + Chapters */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/70 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span className="flex items-center">
                        <RiTimeLine className="mr-1" /> {story.duration}
                      </span>
                      <span className="flex items-center">
                        <RiListCheck className="mr-1" /> {story.chapters} chương
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Tác giả: {story.author}
                </p>
                <p className="text-orange-400 text-sm mb-3">
                  Người kể: {story.narrator}
                </p>
                <div className="flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center text-sm text-gray-400">
                    <RiStarFill className="text-yellow-400 mr-1" />
                    <span>{story.rating}</span>
                  </div>
                  {/* Play Button */}
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap flex items-center">
                    <RiPlayFill className="mr-1" /> Nghe
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        {/* Prev */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Trang trước
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-orange-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {index + 1}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
