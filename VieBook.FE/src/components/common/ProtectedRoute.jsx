import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentRole } from '../../api/authApi';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
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
    const hasPermission = allowedRoles.some(role => 
      userRole.toLowerCase() === role.toLowerCase()
    );
    
    if (!hasPermission) {
      // Không có quyền, redirect về trang access denied
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Có quyền truy cập
  return children;
};

export default ProtectedRoute;
