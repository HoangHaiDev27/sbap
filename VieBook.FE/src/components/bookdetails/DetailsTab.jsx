import React from "react";

export default function DetailsTab({ bookDetail }) {
  const { isbn, language, totalView, createdAt, categories } = bookDetail;

  return (
    <ul className="text-gray-300 space-y-2">
      <li>ISBN: {isbn}</li>
      <li>Ngôn ngữ: {language}</li>
      <li>Lượt xem: {totalView}</li>
      <li>Ngày tạo: {new Date(createdAt).toLocaleDateString()}</li>
      <li>Thể loại: {categories?.join(", ")}</li>
    </ul>
  );
}
