import React from "react";
import { useParams, useLocation } from "react-router-dom";
import ReaderManager from "../layouts/ReaderManager";

export default function ReaderPage() {
  const { id, chapterId } = useParams();
  const location = useLocation();
  
  // Debug logs
  console.log("ReaderPage - URL params:", { id, chapterId });
  console.log("ReaderPage - Current URL:", window.location.href);
  console.log("ReaderPage - location:", location);
  console.log("ReaderPage - pathname:", location.pathname);

  // Fallback: Parse URL manually if useParams doesn't work
  let actualId = id;
  let actualChapterId = chapterId;
  
  if (!actualId || !actualChapterId) {
    console.warn("ReaderPage - useParams failed, parsing URL manually");
    const pathname = location.pathname;
    console.log("ReaderPage - pathname:", pathname);
    
    // Parse /reader/:id/chapter/:chapterId
    const match = pathname.match(/\/reader\/(\d+)\/chapter\/(\d+)/);
    if (match) {
      actualId = match[1];
      actualChapterId = match[2];
      console.log("ReaderPage - Parsed from URL:", { actualId, actualChapterId });
    } else {
      console.error("ReaderPage - Could not parse URL:", pathname);
    }
  }

  return <ReaderManager bookId={actualId} chapterId={actualChapterId} />;
}
