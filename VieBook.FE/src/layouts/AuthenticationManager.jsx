import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import ForgotPassword from "../components/auth/ForgotPassword";
import ChangePassword from "../components/auth/ChangePassword";

export default function AuthenticationManager({ defaultTab }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab || "login");

  // Nếu dùng route /auth/change-password thì mặc định hiển thị tab change
  useEffect(() => {
    if (location.pathname === "/auth/change-password") {
      setActiveTab("change");
    }
  }, [location.pathname]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "login":
        return <Login setActiveTab={setActiveTab} />;
      case "register":
        return <Register setActiveTab={setActiveTab} />;
      case "forgot":
        return <ForgotPassword setActiveTab={setActiveTab} />;
      case "change":
        return <ChangePassword setActiveTab={setActiveTab} />;
      default:
        return <Login setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 px-8 rounded-2xl shadow-xl">
        {renderTabContent()}
      </div>
    </div>
  );
}
