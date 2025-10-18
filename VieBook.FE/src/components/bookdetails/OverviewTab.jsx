import React, { useState } from "react";

export default function OverviewTab({ bookDetail }) {
  const { description, chapters } = bookDetail;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Logic cắt ngắn description
  const maxDescriptionLength = 200;
  const shouldTruncate =
    description && description.length > maxDescriptionLength;
  const displayDescription =
    shouldTruncate && !isDescriptionExpanded
      ? description.substring(0, maxDescriptionLength) + "..."
      : description;

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-300">{displayDescription}</p>
        {shouldTruncate && (
          <button
            onClick={() =>
              setIsDescriptionExpanded(!isDescriptionExpanded)
            }
            className="text-orange-400 hover:text-orange-300 text-sm mt-2 font-medium transition-colors"
          >
            {isDescriptionExpanded ? "Xem ít hơn" : "Xem thêm"}
          </button>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Chương</h3>
        <ul className="list-disc list-inside text-gray-300">
          {chapters?.map((ch) => (
            <li key={ch.chapterId}>
              {ch.chapterTitle} ({Math.round(ch.durationSec / 60)} phút)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
