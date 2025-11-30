import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentRole, getAllRoles } from '../../api/authApi';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const [authKey, setAuthKey] = useState(0);

  // Lắng nghe event auth:changed để re-render khi token được refresh
  useEffect(() => {
    const handleAuthChanged = () => {
      // Force re-render bằng cách update state
      setAuthKey(prev => prev + 1);
    };

    window.addEventListener("auth:changed", handleAuthChanged);
    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged);
    };
  }, []);

  // Nếu không yêu cầu auth, cho phép truy cập
  if (!requireAuth) {
    return children;
  }

  // Kiểm tra xem user đã đăng nhập chưa
  const userRole = getCurrentRole();
  
  if (!userRole) {
    // Chưa đăng nhập, redirect về trang login
    return <Navigate to="/auth" replace />;
  }

  // Nếu có danh sách roles được phép
  if (allowedRoles.length > 0) {
    // Lấy tất cả roles của user (không chỉ current role)
    const allUserRoles = getAllRoles();
    
    // Kiểm tra xem user có ít nhất một role được phép không
    const hasPermission = allowedRoles.some(allowedRole => {
      const normalizedAllowedRole = allowedRole.toLowerCase();
      // Kiểm tra trong tất cả roles của user
      return allUserRoles.some(userRole => 
        userRole.toLowerCase() === normalizedAllowedRole
      );
    });
    
    if (!hasPermission) {
      // Không có quyền, redirect về trang access denied
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Có quyền truy cập
  return children;
};

export default ProtectedRoute;
