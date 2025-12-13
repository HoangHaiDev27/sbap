import React, { useEffect, useRef, useState } from 'react';

const GoogleIdentityLogin = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 50; // 50 * 200ms = 10 seconds max wait time

  useEffect(() => {
    // Cleanup function to prevent memory leaks
    let retryTimeout = null;
    let isMounted = true;

    const initializeGoogle = () => {
      // Check if component is still mounted
      if (!isMounted) return;

      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          // Prevent multiple initializations
          if (isInitialized) {
            console.log('[Google Login] Already initialized, skipping...');
            return;
          }

          console.log('[Google Login] Initializing Google Identity...');
          
          window.google.accounts.id.initialize({
            client_id: "889743573215-vso9piikv2olur00ttq8kactvm10jtss.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render the button only if ref is available
          if (buttonRef.current && !buttonRef.current.hasChildNodes()) {
            try {
              window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 300,
              });
              console.log('[Google Login] Button rendered successfully');
              setIsInitialized(true);
            } catch (renderError) {
              console.error('[Google Login] Button render error:', renderError);
              if (onError) onError('Lỗi render nút Google');
            }
          } else if (buttonRef.current && buttonRef.current.hasChildNodes()) {
            // Button already rendered
            console.log('[Google Login] Button already rendered');
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('[Google Login] Initialization error:', error);
          if (onError && isMounted) {
            onError('Lỗi khởi tạo Google Identity: ' + error.message);
          }
        }
      } else {
        // Retry with exponential backoff
        retryCountRef.current += 1;
        if (retryCountRef.current < maxRetries) {
          const delay = Math.min(200 * retryCountRef.current, 1000); // Max 1 second delay
          console.log(`[Google Login] Script not loaded yet, retrying in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})...`);
          retryTimeout = setTimeout(initializeGoogle, delay);
        } else {
          console.error('[Google Login] Max retries reached. Google script may not be loaded.');
          if (onError && isMounted) {
            onError('Không thể tải Google Identity. Vui lòng kiểm tra kết nối mạng.');
          }
        }
      }
    };

    // Start initialization
    initializeGoogle();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [onError]); // Removed isInitialized from dependencies to prevent infinite loop

  const handleGoogleResponse = (response) => {
    console.log('[Google Login] Response received');
    if (!response || !response.credential) {
      console.error('[Google Login] Invalid response:', response);
      if (onError) {
        onError('Phản hồi từ Google không hợp lệ');
      }
      return;
    }
    
    if (onSuccess) {
      onSuccess(response.credential);
    }
  };

  const handleCustomGoogleLogin = () => {
    console.log('[Google Login] Custom button clicked');
    
    // Check if Google script is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('[Google Login] Google script not loaded');
      if (onError) {
        onError('Google Identity chưa được tải. Vui lòng tải lại trang.');
      }
      return;
    }

    // Check if initialized
    if (!isInitialized) {
      console.warn('[Google Login] Not initialized yet, waiting...');
      // Wait a bit and retry
      setTimeout(() => {
        if (isInitialized) {
          handleCustomGoogleLogin();
        } else {
          if (onError) {
            onError('Google Identity chưa sẵn sàng. Vui lòng thử lại.');
          }
        }
      }, 500);
      return;
    }

    // Trigger click on the hidden Google button
    if (buttonRef.current) {
      const googleButton = buttonRef.current.querySelector('div[role="button"]');
      if (googleButton) {
        console.log('[Google Login] Triggering Google button click');
        googleButton.click();
      } else {
        // Fallback: try to find any clickable element
        const clickableElement = buttonRef.current.querySelector('*');
        if (clickableElement) {
          console.log('[Google Login] Using fallback click');
          clickableElement.click();
        } else {
          console.error('[Google Login] Google button not found in DOM');
          if (onError) {
            onError('Không thể tìm thấy nút Google. Vui lòng tải lại trang.');
          }
        }
      }
    } else {
      console.error('[Google Login] Button ref not available');
      if (onError) {
        onError('Google Identity chưa được tải');
      }
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
