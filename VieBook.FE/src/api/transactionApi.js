import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

const API_URL = `${API_ENDPOINTS.API_BASE_URL}/api/Users`;

// Lấy lịch sử giao dịch của user hiện tại (kết hợp WalletTransaction và OrderItem)
export async function getUserTransactionHistory() {
  try {
    const response = await authFetch(`${API_URL}/transaction-history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

// Lấy danh sách giao dịch ví của user hiện tại
export async function getUserWalletTransactions() {
  try {
    const response = await authFetch(`${API_URL}/wallet-transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch wallet transactions");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
}

