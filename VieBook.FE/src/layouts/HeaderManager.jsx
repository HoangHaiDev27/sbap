import React from "react";
import UserHeader from "../components/header/UserHeader";
import StaffHeader from "../components/header/StaffHeader";
import AdminHeader from "../components/header/AdminHeader";

export default function HeaderManager({ role }) {
  switch (role) {
    case "user":
      return <UserHeader />;
    case "staff":
      return <StaffHeader />;
    case "admin":
      return <AdminHeader />;
    default:
      return null;
  }
}
