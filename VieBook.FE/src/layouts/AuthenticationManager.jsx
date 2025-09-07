import React, { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import ForgotPassword from "../components/auth/ForgotPassword";

export default function AuthenticationManager() {
  const [activeTab, setActiveTab] = useState("login");

  const renderTabContent = () => {
    switch (activeTab) {
      case "login":
        return <Login setActiveTab={setActiveTab} />;
      case "register":
        return <Register setActiveTab={setActiveTab} />;
      case "forgot":
        return <ForgotPassword setActiveTab={setActiveTab} />;
      default:
        return <Login setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl">
        {renderTabContent()}
      </div>
    </div>
  );
}
