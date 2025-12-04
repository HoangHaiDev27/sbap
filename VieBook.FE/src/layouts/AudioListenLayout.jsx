import React from "react";
import AudioPlayer from "../components/audio/AudioPlayer";

export default function AudioListenLayout({ bookId, chapterId }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AudioPlayer bookId={bookId} chapterId={chapterId} />
    </div>
  );
}

