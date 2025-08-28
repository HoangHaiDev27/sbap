import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useActiveMenu(menuItems, defaultId = "home") {
  const [activeMenu, setActiveMenu] = useState(defaultId);
  const location = useLocation();

  useEffect(() => {
    // tìm item nào trùng với đường dẫn hiện tại
    const foundMenu = menuItems.find((item) => item.href === location.pathname);
    if (foundMenu) {
      setActiveMenu(foundMenu.id);
    }
  }, [location.pathname, menuItems]);

  return { activeMenu, setActiveMenu, pathname: location.pathname };
}
