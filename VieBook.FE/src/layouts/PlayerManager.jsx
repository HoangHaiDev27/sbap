import React from "react";
import BookPlayer from "../components/player/BookPlayer";

export default function PlayerManager({ bookId }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <BookPlayer bookId={bookId} />
    </div>
  );
}
