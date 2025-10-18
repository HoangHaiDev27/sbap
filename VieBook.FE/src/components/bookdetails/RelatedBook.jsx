import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { RiStarFill, RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getRelatedBooks } from "../../api/bookApi";

export default function BookRelated({ currentBookId }) {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      if (!currentBookId) return;
      setIsLoading(true);
      try {
        const books = await getRelatedBooks(currentBookId);
        setRelatedBooks(books || []);
      } catch (err) {
        console.error("Lỗi khi fetch related books:", err);
        setRelatedBooks([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentBookId]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = 300; // số pixel scroll mỗi lần
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Sách cùng thể loại</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          <span className="ml-2 text-gray-400">Đang tải...</span>
        </div>
      ) : relatedBooks.length > 0 ? (
        <div className="relative">
          {/* Nút điều hướng trái */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
               bg-gray-800/80 hover:bg-gray-700 text-white 
               p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110
               disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <RiArrowLeftSLine className="text-xl" />
          </button>

          {/* Nút điều hướng phải */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
               bg-gray-800/80 hover:bg-gray-700 text-white 
               p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110
               disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <RiArrowRightSLine className="text-xl" />
          </button>

          {/* Container cho sách với scroll */}
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
          >
            {relatedBooks.map((book) => (
              <Link
                key={book.id}
                to={`/bookdetails/${book.id}`}
                className="flex-shrink-0 cursor-pointer group"
              >
                <div className="w-64">
                  <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">
                        {book.author}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-2">
                        <RiStarFill className="text-yellow-400 text-sm group-hover:text-yellow-300 transition-colors" />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          {book.rating?.toFixed(1) || '0.0'} ({book.reviews || 0})
                        </span>
                      </div>

                      <span className="text-orange-400 font-semibold text-sm group-hover:text-orange-300 transition-colors">
                        {book.price?.toLocaleString() || '0'} xu
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">Không có sách liên quan</p>
          <p className="text-gray-500 text-sm">Hãy thử xem các sách khác trong cùng thể loại</p>
        </div>
      )}
    </section>
  );
}
