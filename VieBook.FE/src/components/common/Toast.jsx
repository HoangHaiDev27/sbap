import React, { useEffect, useState } from "react";

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      console.log("Toast received:", e.detail);
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-semibold
      ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {toast.message}
    </div>
  );
}