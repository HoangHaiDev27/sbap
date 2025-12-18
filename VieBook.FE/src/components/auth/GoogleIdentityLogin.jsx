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
          console.log('[Google Login] Initializing Google Identity...');
          console.log('[Google Login] Current origin:', window.location.origin);
          console.log('[Google Login] Current hostname:', window.location.hostname);
          
          // Always re-initialize to ensure it's fresh
          window.google.accounts.id.initialize({
            client_id: "889743573215-vso9piikv2olur00ttq8kactvm10jtss.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear existing button and re-render
          if (buttonRef.current) {
            // Clear existing content
            buttonRef.current.innerHTML = '';
            
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
              if (onError && isMounted) onError('Lỗi render nút Google');
            }
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

    // Listen for resize events to re-initialize if needed (fixes viewport change issues)
    const handleResize = () => {
      if (window.google && window.google.accounts && window.google.accounts.id && buttonRef.current) {
        console.log('[Google Login] Viewport changed, re-checking button...');
        // Small delay to ensure DOM is stable
        setTimeout(() => {
          if (buttonRef.current && !buttonRef.current.hasChildNodes()) {
            console.log('[Google Login] Button missing after resize, re-initializing...');
            setIsInitialized(false);
            retryCountRef.current = 0;
            initializeGoogle();
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [onError]); // Removed isInitialized from dependencies to prevent infinite loop

  const handleGoogleResponse = (response) => {
    console.log('[Google Login] Response received');
    console.log('[Google Login] Current origin:', window.location.origin);
    
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

    // If not initialized, try to initialize synchronously
    if (!isInitialized) {
      console.log('[Google Login] Initializing on demand...');
      try {
        window.google.accounts.id.initialize({
          client_id: "889743573215-vso9piikv2olur00ttq8kactvm10jtss.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setIsInitialized(true);
      } catch (error) {
        console.error('[Google Login] Initialization error:', error);
        if (onError) {
          onError('Google Identity chưa sẵn sàng. Vui lòng thử lại.');
        }
        return;
      }
    }

    // Trigger Google login immediately (no await/setTimeout to preserve user gesture)
    triggerButtonClick();
  };

  const triggerButtonClick = () => {
    // Click the rendered button directly (no prompt() to avoid FedCM issues)
    // This must happen synchronously in the same event loop as user click
    clickRenderedButton();
  };

  const clickRenderedButton = () => {
    if (!buttonRef.current) {
      console.error('[Google Login] Button ref not available');
      if (onError) {
        onError('Google Identity chưa được tải');
      }
      return;
    }

    // Check if button has been rendered
    if (!buttonRef.current.hasChildNodes()) {
      console.error('[Google Login] Button not rendered yet');
      if (onError) {
        onError('Nút Google chưa được render. Vui lòng thử lại.');
      }
      return;
    }

    console.log('[Google Login] Attempting to click Google button');
    
    // Try clicking iframe first (Google button is typically inside an iframe)
    const iframe = buttonRef.current.querySelector('iframe');
    if (iframe) {
      console.log('[Google Login] Found iframe, triggering click events');
      try {
        // Dispatch multiple events to ensure iframe responds
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        iframe.dispatchEvent(clickEvent);
        
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        iframe.dispatchEvent(mouseDownEvent);
        
        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        iframe.dispatchEvent(mouseUpEvent);
        
        console.log('[Google Login] Iframe click events dispatched');
        return;
      } catch (e) {
        console.warn('[Google Login] Iframe click failed:', e);
      }
    }

    // Fallback: try to find and click div elements (in case Google changes rendering)
    const divButton = buttonRef.current.querySelector('div[role="button"]');
    if (divButton) {
      console.log('[Google Login] Found div button, clicking');
      try {
        divButton.click();
        return;
      } catch (e) {
        console.warn('[Google Login] Div button click failed:', e);
      }
    }

    console.error('[Google Login] Could not find clickable element');
    if (onError) {
      onError('Không thể kích hoạt nút Google. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full relative" style={{ minHeight: '44px' }}>
      {/* Custom styled button (visual only) */}
      <div
        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2 pointer-events-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1
        }}
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
      </div>
      
      {/* Real Google button - overlay on top with opacity 0 but clickable */}
      <div 
        ref={buttonRef} 
        className="w-full" 
        style={{ 
          position: 'relative',
          zIndex: 2,
          opacity: 0,
          cursor: 'pointer'
        }}
      ></div>
    </div>
  );
};

export default GoogleIdentityLogin;
