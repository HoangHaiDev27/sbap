import React, { useEffect, useRef } from 'react';

const GoogleIdentityLogin = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: "889743573215-vso9piikv2olur00ttq8kactvm10jtss.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render the button
          if (buttonRef.current) {
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 300, // Use number instead of percentage
            });
          }
        } catch (error) {
          console.error('Google Identity initialization error:', error);
          if (onError) onError('Lỗi khởi tạo Google Identity');
        }
      } else {
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initializeGoogle, 100);
      }
    };

    initializeGoogle();
  }, [onError]);

  const handleGoogleResponse = (response) => {
    console.log('Google Identity response received');
    if (onSuccess) {
      onSuccess(response.credential);
    }
  };

  const handleCustomGoogleLogin = () => {
    // Trigger click on the hidden Google button
    if (buttonRef.current) {
      const googleButton = buttonRef.current.querySelector('div[role="button"]');
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: try to find any clickable element
        const clickableElement = buttonRef.current.querySelector('*');
        if (clickableElement) {
          clickableElement.click();
        } else {
          if (onError) onError('Không thể tìm thấy nút Google');
        }
      }
    } else {
      if (onError) onError('Google Identity chưa được tải');
    }
  };

  return (
    <div className="w-full relative">
      <button
        type="button"
        onClick={handleCustomGoogleLogin}
        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center justify-center space-x-2 z-10 relative"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Đăng nhập với Google</span>
      </button>
      {/* Hidden Google button - will be rendered by Google Identity API */}
      <div 
        ref={buttonRef} 
        className="w-full" 
        style={{ 
          opacity: 0, 
          position: 'absolute', 
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: -1,
          height: '100%'
        }}
      ></div>
    </div>
  );
};

export default GoogleIdentityLogin;
