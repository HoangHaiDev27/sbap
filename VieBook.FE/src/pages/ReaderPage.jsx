import React from "react";
import { useParams } from "react-router-dom";
import ReaderManager from "../layouts/ReaderManager";

export default function ReaderPage() {
  const { id } = useParams();

  const book = {
    id: parseInt(id),
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    totalPages: 320,
    currentChapter: "Chương 1: Những Nguyên Tắc Cơ Bản Trong Giao Tiếp",
  };

  return <ReaderManager book={book} />;
}
