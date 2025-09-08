import ClientSidebar from "../components/sidebar/ClientSidebar";
import StaffSidebar from "../components/sidebar/StaffSidebar";
import AdminSidebar from "../components/sidebar/AdminSidebar";

export default function SidebarManager({ role, isOpen, onClose }) {
  if (role === "staff") {
    return <StaffSidebar isOpen={isOpen} onClose={onClose} />;
  }
  if (role === "admin") {
    return <AdminSidebar isOpen={isOpen} onClose={onClose} />;
  }
  return <ClientSidebar isOpen={isOpen} onClose={onClose} />;
}

