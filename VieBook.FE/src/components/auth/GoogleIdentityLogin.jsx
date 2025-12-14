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
            // Opt-in to FedCM for future compatibility
            use_fedcm_for_prompt: true,
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

  const handleCustomGoogleLogin = async () => {
    console.log('[Google Login] Custom button clicked');
    console.log('[Google Login] Is initialized:', isInitialized);
    console.log('[Google Login] Button ref exists:', !!buttonRef.current);
    console.log('[Google Login] Button has children:', buttonRef.current?.hasChildNodes());
    
    // Check if Google script is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('[Google Login] Google script not loaded');
      if (onError) {
        onError('Google Identity chưa được tải. Vui lòng tải lại trang.');
      }
      return;
    }

    // Ensure initialization is complete before triggering
    if (!isInitialized || !buttonRef.current || !buttonRef.current.hasChildNodes()) {
      console.log('[Google Login] Not ready yet, initializing...');
      
      // Force re-initialization
      try {
        window.google.accounts.id.initialize({
          client_id: "889743573215-vso9piikv2olur00ttq8kactvm10jtss.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 300,
          });
          setIsInitialized(true);
          
          // Wait for button to be fully rendered
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error('[Google Login] Re-initialization error:', error);
        if (onError) {
          onError('Google Identity chưa sẵn sàng. Vui lòng thử lại.');
        }
        return;
      }
    }

    // Wait a bit to ensure button is fully interactive
    await new Promise(resolve => setTimeout(resolve, 100));

    // Note: We avoid using prompt() with notification callbacks to avoid FedCM warnings
    // Instead, we directly trigger the button click which is more reliable and FedCM-compatible
    triggerButtonClick();
  };

  const triggerButtonClick = () => {
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

    // Try multiple selectors to find the Google button (in order of preference)
    const selectors = [
      'div[role="button"]',  // Most common
      'iframe',              // Google button is often in an iframe
      'div[data-testid]',
      'div[aria-label*="Sign in"]',
      'div[aria-label*="Google"]',
      'div > div',           // Nested div structure
      '*'
    ];

    let clicked = false;

    for (const selector of selectors) {
      const element = buttonRef.current.querySelector(selector);
      if (element) {
        console.log(`[Google Login] Found element with selector: ${selector}`);
        
        // Try different click methods
        try {
          // Method 1: Check if it's an iframe and access its content
          if (element.tagName === 'IFRAME') {
            console.log('[Google Login] Found iframe, trying to access content...');
            try {
              const iframeDoc = element.contentDocument || element.contentWindow?.document;
              if (iframeDoc) {
                const iframeButton = iframeDoc.querySelector('div[role="button"]') || 
                                   iframeDoc.querySelector('div') ||
                                   iframeDoc.body;
                if (iframeButton) {
                  iframeButton.click();
                  console.log('[Google Login] Clicked button inside iframe');
                  clicked = true;
                  break;
                }
              }
            } catch (iframeError) {
              console.warn('[Google Login] Cannot access iframe content (CORS):', iframeError);
              // Fall through to click iframe itself
            }
          }

          // Method 2: Direct click
          element.click();
          console.log('[Google Login] Direct click triggered successfully');
          clicked = true;
          break;
        } catch (e1) {
          console.warn('[Google Login] Direct click failed, trying mouse event:', e1);
          
          try {
            // Method 3: Mouse event with more options
            const mouseEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              buttons: 1,
              button: 0
            });
            element.dispatchEvent(mouseEvent);
            console.log('[Google Login] Mouse event triggered');
            clicked = true;
            break;
          } catch (e2) {
            console.warn('[Google Login] Mouse event failed:', e2);
            
            try {
              // Method 4: Touch event (for mobile)
              const touchEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true
              });
              element.dispatchEvent(touchEvent);
              console.log('[Google Login] Touch event triggered');
              clicked = true;
              break;
            } catch (e3) {
              console.warn('[Google Login] Touch event failed:', e3);
            }
          }
        }
      }
    }

    if (!clicked) {
      console.error('[Google Login] Google button not found or not clickable in DOM');
      console.log('[Google Login] Button ref content:', buttonRef.current.innerHTML);
      if (onError) {
        onError('Không thể tìm thấy nút Google. Vui lòng tải lại trang.');
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
