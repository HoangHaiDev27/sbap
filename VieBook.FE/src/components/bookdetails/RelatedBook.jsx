import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiStarFill } from "react-icons/ri";
import { getRelatedBooks } from "../../api/bookApi";

export default function BookRelated({ currentBookId }) {
  const [relatedBooks, setRelatedBooks] = useState([]);

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

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Sách cùng thể loại</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedBooks.length > 0 ? (
          relatedBooks.map((book) => (
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
          ))
        ) : (
          <p className="text-gray-400">Không có sách liên quan.</p>
        )}
      </div>
    </section>
  );
}
