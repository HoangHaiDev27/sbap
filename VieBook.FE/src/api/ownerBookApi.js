import { API_ENDPOINTS } from "../config/apiConfig";

// Lấy tất cả sách theo ownerId
export async function getBooksByOwner(ownerId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.GET_ALL_BY_OWNER(ownerId));
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

// Lấy chi tiết 1 sách
export async function getBookById(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.GET_BY_ID(bookId));
  if (!res.ok) throw new Error("Failed to fetch book detail");
  return res.json();
}

// Tạo mới sách
export async function createBook(payload) {
  const res = await fetch(API_ENDPOINTS.BOOKS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 409) {
      // BE trả về Conflict ISBN
      const message = await res.text();
      throw new Error(message || "ISBN đã tồn tại");
    }
    throw new Error("Tạo mới sách thất bại");
  }

  return res.json();
}


// Cập nhật sách
export async function updateBook(bookId, payload) {
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE(bookId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Cập nhật sách thất bại";
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "ISBN đã tồn tại hoặc dữ liệu không hợp lệ.";
      }
    }
    throw new Error(errorMessage);
  }

  return true;
}



// Xóa sách
export async function deleteBook(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.DELETE(bookId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không thể xóa sách");
  return true;
}

// Lấy tất cả categories
export async function getCategories() {
  const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ALL);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}
// up ảnh lên cloudiary
export async function uploadBookImage(formData) {
  const res = await fetch(API_ENDPOINTS.UPLOADBOOKIMAGE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload ảnh thất bại");
  const data = await res.json();
  return data.imageUrl;
}
// xóa ảnh trên Cloudinary
export async function removeOldBookImage(imageUrl) {
  const res = await fetch(
    `${API_ENDPOINTS.REMOVEOLDBOOKIMAGE}?imageUrl=${encodeURIComponent(imageUrl)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    throw new Error("Xóa ảnh thất bại");
  }
  const data = await res.json();
  return data.message;
}
//////Chaper///////////////////
// Lấy chi tiết 1 chapter
export async function getChapterById(chapterId) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.GET_BY_ID(chapterId));
  if (!res.ok) throw new Error("Failed to fetch chapter detail");
  return res.json();
}

// Lấy danh sách chapter theo bookId
export async function getChaptersByBookId(bookId) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.GET_BY_BOOK_ID(bookId));
  if (!res.ok) throw new Error("Failed to fetch chapters by book");
  return res.json();
}

// Tạo mới chapter
export async function createChapter(payload) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 409) {
      const message = await res.text();
      throw new Error(message || "Chapter already exists");
    }
    throw new Error("Failed to create chapter");
  }

  return res.json();
}

// Cập nhật chapter
export async function updateChapter(chapterId, payload) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.UPDATE(chapterId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Chapter not found");
    }
    throw new Error("Cập nhật chương thất bại");
  }

  return res.json();
}

// Xóa chapter
export async function deleteChapter(chapterId) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.DELETE(chapterId), {
    method: "DELETE",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Chapter not found");
    }
    throw new Error("Failed to delete chapter");
  }

  return res.json();
}
// Upload chapter content to Cloudinary
export async function uploadChapterFile(chapterData) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.UPLOAD_FILE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chapterData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.message || "Failed to upload chapter");
  }

  return res.json();
}
// Dếm từ
export async function getWordCountFromUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Không lấy được file");
    const text = await res.text();
    // Tách từ bằng regex: chữ cái, số, bỏ ký tự đặc biệt
    const words = text.trim().split(/\s+/);
    return words.length;
  } catch (err) {
    console.error("Lỗi khi đếm từ:", err);
    return 0;
  }
}

////////////////////////////
// Gọi API chuyển văn bản thành audio (TTS)
export async function generateChapterAudio(chapterId, voiceName = "banmai", speed = 1.0) {
  const res = await fetch(
    API_ENDPOINTS.AUDIO_CONVERSION.GENERATE(chapterId, voiceName, speed),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Không tìm thấy chương cần chuyển audio");
    }
    throw new Error("Tạo audio thất bại");
  }

  return res.json();
}
