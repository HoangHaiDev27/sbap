import { useState, useEffect } from "react";
import { getUserId, getCurrentUser } from "../api/authApi";

export const useCurrentUser = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUserId = getUserId();
        const currentUser = getCurrentUser();
        
        setUserId(currentUserId);
        setUser(currentUser);
        setIsLoading(false);
        
        console.log("Current user loaded:", { userId: currentUserId, user: currentUser });
      } catch (error) {
        console.error("Error loading current user:", error);
        setUserId(null);
        setUser(null);
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener("auth:changed", handleAuthChange);
    
    return () => {
      window.removeEventListener("auth:changed", handleAuthChange);
    };
  }, []);

  return {
    userId,
    user,
    isLoading,
    isAuthenticated: !!userId
  };
};
