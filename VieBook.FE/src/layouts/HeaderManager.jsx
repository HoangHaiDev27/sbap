import React from "react";
import UserHeader from "../components/header/UserHeader";
import StaffHeader from "../components/header/StaffHeader";
import AdminHeader from "../components/header/AdminHeader";
import GuestHeader from "../components/header/GuestHeader";

export default function HeaderManager({ role, onToggleSidebar }) {
  console.log("HeaderManager - Rendering with role:", role);
  
  switch (role) {
    case "customer":
    case "owner":
      console.log("HeaderManager - Rendering UserHeader for customer/owner");
      return <UserHeader onToggleSidebar={onToggleSidebar} />;
    case "staff":
      console.log("HeaderManager - Rendering StaffHeader");
      return <StaffHeader onToggleSidebar={onToggleSidebar} />;
    case "admin":
      console.log("HeaderManager - Rendering AdminHeader");
      return <AdminHeader onToggleSidebar={onToggleSidebar} />;
    default:
      console.log("HeaderManager - Rendering GuestHeader (default)");
      return <GuestHeader onToggleSidebar={onToggleSidebar} />;
  }
}
