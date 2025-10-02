import React from "react";
import UserHeader from "../components/header/UserHeader";
import StaffHeader from "../components/header/StaffHeader";
import AdminHeader from "../components/header/AdminHeader";
import BookOwnerHeader from "../components/header/BookOwnerHeader";
import GuestHeader from "../components/header/GuestHeader";

export default function HeaderManager({ role, onToggleSidebar }) {
  switch (role) {
    case "customer":
      return <UserHeader onToggleSidebar={onToggleSidebar} />;
    case "staff":
      return <StaffHeader onToggleSidebar={onToggleSidebar} />;
    case "admin":
      return <AdminHeader onToggleSidebar={onToggleSidebar} />;
    case "owner":
      return <BookOwnerHeader onToggleSidebar={onToggleSidebar} />;
    default:
      return <GuestHeader onToggleSidebar={onToggleSidebar} />;
  }
}
