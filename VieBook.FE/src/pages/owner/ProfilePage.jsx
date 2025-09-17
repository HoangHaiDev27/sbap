import { useState } from "react";

// import các component con
import ProfileOverview from "../../components/owner/profile/ProfileOverview";
import PersonalInfo from "../../components/owner/profile/PersonalInfo";
import AccountSecurity from "../../components/owner/profile/AccountSecurity";
import NotificationSettings from "../../components/owner/profile/NotificationSettings";

export default function ProfilePage() {
  const [mainTab, setMainTab] = useState("overview"); // overview | settings
  const [subTab, setSubTab] = useState("personal");   // personal | security | notifications

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Hồ sơ cá nhân</h1>
      <p className="text-gray-400 mb-6">
        Quản lý thông tin và cài đặt tài khoản của bạn
      </p>

      {/* Tabs cấp 1 */}
      <div className="flex space-x-4 border-b border-gray-600 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            mainTab === "overview" ? "border-b-2 border-orange-500 text-orange-500" : ""
          }`}
          onClick={() => setMainTab("overview")}
        >
          Tổng quan
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            mainTab === "settings" ? "border-b-2 border-orange-500 text-orange-500" : ""
          }`}
          onClick={() => setMainTab("settings")}
        >
          Cài đặt
        </button>
      </div>

      {/* Nội dung tab chính */}
      {mainTab === "overview" && <ProfileOverview />}

      {mainTab === "settings" && (
        <div>
          {/* Tabs cấp 2 */}
          <div className="flex space-x-4 border-b border-gray-600 mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                subTab === "personal" ? "border-b-2 border-orange-500 text-orange-500" : ""
              }`}
              onClick={() => setSubTab("personal")}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                subTab === "security" ? "border-b-2 border-orange-500 text-orange-500" : ""
              }`}
              onClick={() => setSubTab("security")}
            >
              Bảo mật tài khoản
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                subTab === "notifications" ? "border-b-2 border-orange-500 text-orange-500" : ""
              }`}
              onClick={() => setSubTab("notifications")}
            >
              Thông báo
            </button>
          </div>

          {/* Nội dung tab con */}
          {subTab === "personal" && <PersonalInfo />}
          {subTab === "security" && <AccountSecurity />}
          {subTab === "notifications" && <NotificationSettings />}
        </div>
      )}
    </div>
  );
}
