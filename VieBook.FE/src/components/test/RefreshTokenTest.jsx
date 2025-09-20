import React, { useState, useEffect } from 'react';
import { authFetch, getToken, getRefreshToken, logout } from '../../api/authApi';

const RefreshTokenTest = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Test 1: Kiểm tra token hiện tại
  const checkCurrentTokens = () => {
    const accessToken = getToken();
    const refreshToken = getRefreshToken();
    
    addLog(`Access Token: ${accessToken ? 'Có' : 'Không'}`, accessToken ? 'success' : 'warning');
    addLog(`Refresh Token: ${refreshToken ? 'Có' : 'Không'}`, refreshToken ? 'success' : 'warning');
    
    if (accessToken) {
      addLog(`Access Token (first 20 chars): ${accessToken.substring(0, 20)}...`);
    }
    if (refreshToken) {
      addLog(`Refresh Token (first 20 chars): ${refreshToken.substring(0, 20)}...`);
    }
  };

  // Test 2: Gọi API với token hiện tại
  const testApiCall = async () => {
    setIsLoading(true);
    try {
      addLog('Đang gọi API /api/users...');
      const response = await authFetch('/api/users');
      
      if (response.ok) {
        addLog('API call thành công!', 'success');
        const data = await response.json();
        addLog(`Nhận được ${data.length || 0} users`);
      } else {
        addLog(`API call thất bại: ${response.status}`, 'error');
      }
    } catch (error) {
      addLog(`Lỗi API call: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Kiểm tra refresh token tự động
  const testAutoRefresh = async () => {
    setIsLoading(true);
    try {
      addLog('Đang test tự động refresh token...');
      
      // Gọi nhiều API calls liên tiếp để trigger refresh nếu cần
      for (let i = 1; i <= 3; i++) {
        addLog(`Gọi API lần ${i}...`);
        const response = await authFetch('/api/users');
        
        if (response.ok) {
          addLog(`API call ${i} thành công`, 'success');
        } else {
          addLog(`API call ${i} thất bại: ${response.status}`, 'error');
        }
        
        // Đợi một chút giữa các calls
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      addLog(`Lỗi test auto refresh: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Logout và kiểm tra token bị xóa
  const testLogout = async () => {
    try {
      addLog('Đang logout...');
      await logout();
      addLog('Logout thành công!', 'success');
      
      // Kiểm tra token sau logout
      setTimeout(() => {
        checkCurrentTokens();
      }, 1000);
    } catch (error) {
      addLog(`Lỗi logout: ${error.message}`, 'error');
    }
  };

  // Test 5: Kiểm tra token expiry
  const checkTokenExpiry = () => {
    const accessToken = getToken();
    if (!accessToken) {
      addLog('Không có access token', 'warning');
      return;
    }

    try {
      // Decode JWT token (chỉ để xem expiry, không verify signature)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiry = new Date(payload.exp * 1000);
      const now = new Date();
      const timeLeft = expiry - now;
      
      addLog(`Token expires at: ${expiry.toLocaleString()}`);
      addLog(`Time left: ${Math.round(timeLeft / 1000 / 60)} minutes`);
      
      if (timeLeft < 0) {
        addLog('Token đã hết hạn!', 'error');
      } else if (timeLeft < 5 * 60 * 1000) {
        addLog('Token sắp hết hạn (< 5 phút)', 'warning');
      } else {
        addLog('Token còn hạn', 'success');
      }
    } catch (error) {
      addLog(`Lỗi decode token: ${error.message}`, 'error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Refresh Token Test</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={checkCurrentTokens}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Kiểm tra Token hiện tại
        </button>
        
        <button
          onClick={testApiCall}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test API Call
        </button>
        
        <button
          onClick={testAutoRefresh}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Auto Refresh
        </button>
        
        <button
          onClick={checkTokenExpiry}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Kiểm tra Token Expiry
        </button>
        
        <button
          onClick={testLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Logout
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Xóa Logs
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
        <h3 className="font-bold mb-2">Test Logs:</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">Chưa có logs nào. Click các button để bắt đầu test.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`mb-1 text-sm ${
              log.type === 'success' ? 'text-green-600' :
              log.type === 'error' ? 'text-red-600' :
              log.type === 'warning' ? 'text-yellow-600' :
              'text-gray-700'
            }`}>
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RefreshTokenTest;
