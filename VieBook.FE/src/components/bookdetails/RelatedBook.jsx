import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiStarFill, RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getRelatedBooks } from "../../api/bookApi";

export default function BookRelated({ currentBookId }) {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const booksPerPage = 4; // Số sách hiển thị mỗi lần

  useEffect(() => {
    async function fetchData() {
      try {
        const books = await getRelatedBooks(currentBookId);
        setRelatedBooks(books);
      } catch (err) {
        console.error("Lỗi khi fetch related books:", err);
      }
    }
    if (currentBookId) fetchData();
  }, [currentBookId]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + booksPerPage >= relatedBooks.length 
        ? 0 
        : prevIndex + booksPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 
        ? Math.max(0, relatedBooks.length - booksPerPage)
        : prevIndex - booksPerPage
    );
  };

  const visibleBooks = relatedBooks.slice(currentIndex, currentIndex + booksPerPage);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Sách cùng thể loại</h2>
      
      {relatedBooks.length > 0 ? (
        <div className="relative">
          {/* Nút điều hướng trái */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            disabled={relatedBooks.length <= booksPerPage}
          >
            <RiArrowLeftSLine className="text-xl" />
          </button>

          {/* Nút điều hướng phải */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            disabled={relatedBooks.length <= booksPerPage}
          >
            <RiArrowRightSLine className="text-xl" />
          </button>

          {/* Container cho sách */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-12">
            {visibleBooks.map((book) => (
              <div
                key={book.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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

                    {/* Rating giống AudiobookGrid */}
                    <div className="flex items-center space-x-2 mb-2">
                      <RiStarFill className="text-yellow-400 text-sm" />
                      <span className="text-sm text-gray-400">
                        {book.rating.toFixed(1)} ({book.reviews})
                      </span>
                    </div>

                    <span className="text-orange-400 font-semibold text-sm">
                      {book.price.toLocaleString()} xu
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          {relatedBooks.length > booksPerPage && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil(relatedBooks.length / booksPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * booksPerPage)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / booksPerPage) === index
                      ? 'bg-orange-400 w-6'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400">Không có sách liên quan.</p>
      )}
    </section>
  );
}
