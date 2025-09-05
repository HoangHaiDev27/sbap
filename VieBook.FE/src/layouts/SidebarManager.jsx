// import AdminSidebar from "./AdminSidebar";

import ClientSidebar from "../components/sidebar/ClientSidebar";
import StaffSidebar from "../components/sidebar/StaffSidebar";

export default function SidebarManager({ role, isOpen, onClose }) {
  if (role === "staff") return <StaffSidebar isOpen={isOpen} onClose={onClose} />;
  //   if (role === "admin") return <AdminSidebar />;
  return <ClientSidebar isOpen={isOpen} onClose={onClose} />; // mặc định client
}
