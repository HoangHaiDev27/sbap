import React from "react";
import AudioPlayer from "../components/audio/AudioPlayer";

export default function AudioListenLayout({ bookId }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AudioPlayer bookId={bookId} />
    </div>
  );
}

