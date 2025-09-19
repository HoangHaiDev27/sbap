import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../src/config/apiConfig";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Đang xác thực...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Token không hợp lệ!");
      return;
    }

    fetch(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Xác thực thành công!");
        setTimeout(() => navigate("/auth"), 2000); // chuyển về login sau 2s
      })
      .catch(() => setMessage("Có lỗi xảy ra khi xác thực!"));
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Xác thực Email</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
