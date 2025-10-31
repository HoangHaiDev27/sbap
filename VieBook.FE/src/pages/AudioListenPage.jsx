import React from "react";
import { useParams } from "react-router-dom";
import AudioListenLayout from "../layouts/AudioListenLayout";

export default function AudioListenPage() {
  const { bookId, chapterId } = useParams();
  return <AudioListenLayout bookId={bookId} chapterId={chapterId} />;
}

