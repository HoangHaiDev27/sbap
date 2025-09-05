import React from "react";
import UserHeader from "../components/header/UserHeader";
import StaffHeader from "../components/header/StaffHeader";
import AdminHeader from "../components/header/AdminHeader";

export default function HeaderManager({ role, onToggleSidebar }) {
  switch (role) {
    case "user":
      return <UserHeader onToggleSidebar={onToggleSidebar} />;
    case "staff":
      return <StaffHeader onToggleSidebar={onToggleSidebar} />;
    case "admin":
      return <AdminHeader onToggleSidebar={onToggleSidebar} />;
    default:
      return null;
  }
}
