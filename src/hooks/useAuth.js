import { useState, useEffect } from "react";

export const useAuth = () => {
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("purplexity_user");
    const savedToken = localStorage.getItem("purplexity_token");
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setAuthUser(user);
        setAuthToken(savedToken);
      } catch (e) {
        console.error("Local token recovery failed:", e);
      }
    }
    setIsAuthLoading(false);
  }, []);

  const handleAuthSuccess = (user, session) => {
    setAuthUser(user);
    const token = session?.access_token || null;
    setAuthToken(token);
    
    if (user) {
      localStorage.setItem("purplexity_user", JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem("purplexity_token", token);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("purplexity_user");
    localStorage.removeItem("purplexity_token");
    setAuthUser(null);
    setAuthToken(null);
  };

  return {
    authUser,
    authToken,
    isAuthLoading,
    handleAuthSuccess,
    handleSignOut,
  };
};
