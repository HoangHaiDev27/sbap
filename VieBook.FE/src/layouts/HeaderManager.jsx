import React from "react";
import ClientHeader from "../components/header/ClientHeader";
import StaffHeader from "../components/header/StaffHeader";
import AdminHeader from "../components/header/AdminHeader";

export default function HeaderManager({ role }) {
  switch (role) {
    case "client":
      return <ClientHeader />;
    case "staff":
      return <StaffHeader />;
    case "admin":
      return <AdminHeader />;
    default:
      return null;
  }
}
