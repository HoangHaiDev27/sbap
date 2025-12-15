import { API_ENDPOINTS, API_BASE_URL } from "../config/apiConfig";
import { getToken, authFetch } from "./authApi";

// Lấy tất cả sách theo ownerId
export async function getBooksByOwner(ownerId) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.BOOKS.GET_ALL_BY_OWNER(ownerId), {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (res.status === 404) {
    // Không có sách, trả về mảng rỗng
    return [];
  }
  if (!res.ok) throw new Error("Tải sách thất bại");
  const data = await res.json();
  // Backend có thể trả về array trực tiếp hoặc wrapped
  return Array.isArray(data) ? data : (data?.data || []);
}

// Lấy chi tiết 1 sách
export async function getBookById(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.GET_BY_ID(bookId));
  if (!res.ok) throw new Error("Tải thông tin sách thất bai");
  return res.json();
}

// Cập nhật tóm tắt chapter (ChapterSummarize)
export async function updateChapterSummary(chapterId, summary) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(`${API_BASE_URL}/api/chapter/${chapterId}/summary`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ summary }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Cập nhật tóm tắt chương thất bại");
  }

  return res.json();
}

// Tạo mới sách
export async function createBook(payload) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.BOOKS.CREATE, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(" Tạo sách thất bại:", res.status, errorText);
    
    if (res.status === 409) {
      // BE trả về Conflict ISBN
      throw new Error(errorText || "ISBN đã tồn tại");
    }
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw new Error(errorText || "Tạo mới sách thất bại");
  }

  const result = await res.json();
  return result;
}

// Tạo mới sách với chữ ký xác nhận (Save with Proof)
export async function createBookWithSignature(payload) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.BOOKS.CREATE_WITH_SIGNATURE, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Tạo mới sách thất bại";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await res.text();
      if (res.status === 409) {
        errorMessage = errorText || "ISBN đã tồn tại";
      } else if (res.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
      } else {
        errorMessage = errorText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  const result = await res.json();
  return result;
}


// Cập nhật sách
export async function updateBook(bookId, payload) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE(bookId), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Cập nhật sách thất bại";
    let errorData = {};
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
      errorData = data;
    } catch {
      errorMessage = "Cập nhật sách thất bại";
    }
    if (res.status === 401) {
      errorMessage = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = errorData;
    throw error;
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

// Cập nhật trạng thái hoàn thành
export async function updateCompletionStatus(bookId, completionStatus, uploadStatus = null) {
  const body = { completionStatus };
  if (uploadStatus) {
    body.uploadStatus = uploadStatus;
  }
  
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE_COMPLETION_STATUS(bookId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update completion status");
  }

  return res.json();
}

// Cập nhật trạng thái upload
export async function updateUploadStatus(bookId, uploadStatus) {
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE_COMPLETION_STATUS(bookId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadStatus }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update upload status");
  }

  return res.json();
}

// Gửi yêu cầu kiểm duyệt cho Seller
export async function submitForApproval(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKAPPROVAL.ADD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookId: bookId,
      action: "Pending",
      createdAt: new Date().toISOString()
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit for approval");
  }

  return res.json();
}

// Lấy giá audio từ ChapterAudios
export async function getChapterAudioPrices(bookId) {
  // Sử dụng endpoint đúng: /api/books/{bookId}/chapters/audio-prices
  const res = await authFetch(`${API_BASE_URL}/api/books/${bookId}/chapters/audio-prices`);
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error(`Failed to fetch audio prices: ${res.status}${detail ? ` - ${detail}` : ""}`);
  }
  return res.json();
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

// Upload certificate
export async function uploadCertificate(formData) {
  const res = await fetch(API_ENDPOINTS.UPLOADCERTIFICATE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    // Xử lý lỗi 413 Request Entity Too Large từ nginx
    if (res.status === 413) {
      throw new Error("Dung lượng ảnh quá lớn");
    }
    
    // Thử parse JSON error message từ backend
    let errorMessage = "Upload giấy chứng nhận thất bại";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Nếu không parse được JSON, đọc text nhưng không hiển thị HTML error
      const errorText = await res.text();
      console.error("❌ Certificate upload failed:", res.status, errorText);
      // Chỉ hiển thị thông báo chung nếu không phải lỗi 413
      if (res.status !== 413) {
        errorMessage = "Upload giấy chứng nhận thất bại";
      }
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return data.fileUrl || data.imageUrl; // Support both field names
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
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.CHAPTERS.GET_BY_ID(chapterId), {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw new Error("Failed to fetch chapter detail");
  }
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
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.CHAPTERS.UPDATE(chapterId), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Chapter not found");
    }
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw new Error("Cập nhật chương thất bại");
  }

  return res.json();
}

// Xóa chapter
export async function deleteChapter(chapterId) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.CHAPTERS.DELETE(chapterId), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Chapter not found");
    }
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw new Error("Failed to delete chapter");
  }

  return res.json();
}

// Tăng số lượt xem chapter
export async function incrementChapterView(chapterId) {
  const res = await fetch(API_ENDPOINTS.CHAPTERS.INCREMENT_VIEW(chapterId), {
    method: "POST",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Chapter not found");
    }
    // Không throw error vì đây là action phụ, không ảnh hưởng đến flow chính
    console.error("Failed to increment chapter view");
  }

  return res.json().catch(() => ({}));
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
export async function generateChapterAudio(chapterId, voiceName = "banmai", speed = 1.0, userId) {
  let baseUrl = API_ENDPOINTS.AUDIO_CONVERSION.GENERATE(chapterId, voiceName, speed);
  
  if (baseUrl.startsWith('/')) {
    baseUrl = window.location.origin + baseUrl;
  }
  
  const url = new URL(baseUrl);
  if (userId) {
    url.searchParams.append('userId', userId);
  }
  
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Không tìm thấy chương cần chuyển audio");
    }
    if (res.status === 400) {
      const error = await res.json();
      // Xử lý riêng trường hợp giọng đã tồn tại
      if (error.message && error.message.includes("đã có audio với giọng")) {
        const errorObj = new Error(error.message);
        errorObj.isVoiceExists = true;
        errorObj.voiceName = error.voiceName;
        throw errorObj;
      }
      throw new Error(error.message || "Tạo audio thất bại");
    }
    throw new Error("Tạo audio thất bại");
  }

  return res.json();
}

// Lấy danh sách audio của chapter
export async function getChapterAudios(chapterId) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(chapterId));
  if (!res.ok) throw new Error("Failed to fetch chapter audios");
  return res.json();
}

// Lấy danh sách chapters có audio của book
export async function getBookChapterAudios(bookId) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_BOOK_CHAPTER_AUDIOS(bookId));
  if (!res.ok) throw new Error("Failed to fetch book chapter audios");
  const data = await res.json();
  return data.data || [];
}

// Lấy audio mới nhất của chapter
export async function getLatestChapterAudio(chapterId) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_LATEST_CHAPTER_AUDIO(chapterId));
  if (!res.ok) throw new Error("Failed to fetch latest chapter audio");
  const data = await res.json();
  return data.data;
}

// Xóa audio
export async function deleteChapterAudio(audioId) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.DELETE_AUDIO(audioId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete audio");
  return res.json();
}

// Cập nhật giá audio
export async function updateChapterAudioPrice(audioId, price) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.UPDATE_AUDIO_PRICE(audioId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceAudio: price }),
  });
  if (!res.ok) throw new Error("Failed to update audio price");
  return res.json();
}

// Cập nhật giá cho tất cả audio của chapter
export async function updateChapterAudiosPrice(chapterId, price) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.UPDATE_CHAPTER_AUDIOS_PRICE(chapterId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceAudio: price }),
  });
  if (!res.ok) throw new Error("Failed to update audio prices");
  return res.json();
}

// Lấy subscription status
export async function getSubscriptionStatus(userId) {
  const res = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_SUBSCRIPTION_STATUS(userId));
  if (!res.ok) throw new Error("Failed to fetch subscription status");
  return res.json();
}

// Kiểm tra xem book có chapter nào có status = Active không
export async function checkBookHasActiveChapter(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.CHECK_ACTIVE_CHAPTERS(bookId));
  if (!res.ok) throw new Error("Failed to check active chapters");
  return res.json();
}

// Cập nhật book status
export async function updateBookStatus(bookId, status) {
  const token = getToken();
  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE_STATUS(bookId), {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    throw new Error(errorData.message || "Failed to update book status");
  }

  return res.json();
}

// Kiểm tra tất cả chapters của book có status = Active không
export async function checkAllChaptersActive(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.CHECK_ALL_CHAPTERS_ACTIVE(bookId));
  if (!res.ok) throw new Error("Failed to check all chapters status");
  return res.json();
}

// Kiểm tra book có chương nào có status = Draft không
export async function checkBookHasDraftChapters(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.CHECK_DRAFT_CHAPTERS(bookId));
  if (!res.ok) throw new Error("Failed to check draft chapters");
  return res.json();
}

// Cập nhật tất cả chương Draft thành InActive
export async function updateDraftChaptersToInActive(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE_DRAFT_CHAPTERS_TO_INACTIVE(bookId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error("Failed to update draft chapters to InActive");
  return res.json();
}