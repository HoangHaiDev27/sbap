// import AdminSidebar from "./AdminSidebar";

import ClientSidebar from "../components/sidebar/ClientSidebar";
import StaffSidebar from "../components/sidebar/StaffSidebar";

export default function SidebarManager({ role }) {
  if (role === "staff") return <StaffSidebar />;
  //   if (role === "admin") return <AdminSidebar />;
  return <ClientSidebar />; // mặc định client
}
