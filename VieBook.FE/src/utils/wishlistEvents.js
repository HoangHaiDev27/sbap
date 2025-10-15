// Helper function to dispatch wishlist change events
export const dispatchWishlistChange = () => {
  console.log("Dispatching wishlist change event...");
  
  // Create and dispatch custom event
  const event = new CustomEvent('wishlistChanged', {
    detail: { timestamp: Date.now() }
  });
  
  // Dispatch on both document and window for better compatibility
  document.dispatchEvent(event);
  window.dispatchEvent(event);
};

// Helper function to dispatch wishlist change with delay (for API calls)
export const dispatchWishlistChangeDelayed = (delay = 500) => {
  setTimeout(() => {
    dispatchWishlistChange();
  }, delay);
};
