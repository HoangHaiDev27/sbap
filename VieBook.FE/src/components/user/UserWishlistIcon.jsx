import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RiHeartLine, RiHeartFill } from "react-icons/ri";
import { getMyWishlist } from "../../api/wishlistApi";
import { getUserId } from "../../api/authApi";

export default function UserWishlistIcon() {
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    const uid = getUserId();
    if (uid) {
      try {
        const wishlist = await getMyWishlist();
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
        setWishlistCount(0);
      }
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, []);

  // Refresh wishlist count when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchWishlistCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for wishlist changes
  useEffect(() => {
    const handleWishlistChange = () => {
      console.log("Wishlist change detected, refreshing count...");
      fetchWishlistCount();
    };

    // Listen for custom wishlist change events
    document.addEventListener('wishlistChanged', handleWishlistChange);
    window.addEventListener('wishlistChanged', handleWishlistChange);

    return () => {
      document.removeEventListener('wishlistChanged', handleWishlistChange);
      window.removeEventListener('wishlistChanged', handleWishlistChange);
    };
  }, []);

  return (
    <Link
      to="/library?tab=favorites"
      className="relative hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
      title="Sách yêu thích"
    >
      <RiHeartLine className="text-2xl text-white" />
      {wishlistCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-lg border-2 border-white">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
    </Link>
  );
}
