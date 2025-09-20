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

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleIdentityLogin;
