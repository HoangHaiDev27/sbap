import { API_ENDPOINTS } from "../config/apiConfig";
async function handleFetch(url, options = {}, defaultError) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = defaultError;
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  // Nếu là 204 No Content thì không parse JSON
  if (res.status === 204) return true;

  return res.json();
}

// ================= RANKING API =================

/**
 * Lấy thống kê tổng hợp (số lượng từng loại)
 * GET /api/rankings/summary
 */
export async function getRankingSummary() {
  return handleFetch(
    API_ENDPOINTS.RANK.GETRANKINGSUMMARY,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    },
    "Failed to fetch ranking summary"
  );
}

/**
 * Lấy danh sách top 5 sách cho từng loại (Popular, TopRated, NewRelease, Trending)
 * GET /api/rankings/details
 */
export async function getRankingList(type) {
  // đảm bảo có type để mỗi component gọi đúng loại
  const url = `${API_ENDPOINTS.RANK.GETRANKINGLIST}?type=${encodeURIComponent(type)}`;

  return handleFetch(
    url,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
    `Failed to fetch ranking list for type: ${type}`
  );
}
