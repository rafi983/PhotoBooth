import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (userData, accessToken, refreshToken) => {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(userData);
      setToken(accessToken);
      navigate("/");
    },
    [navigate],
  );

  const signupAndRedirect = useCallback(
    (userData, accessToken, refreshToken) => {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(userData);
      setToken(accessToken);
      navigate("/edit-profile");
    },
    [navigate],
  );

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setToken(null);
    navigate("/login");
  }, [navigate]);

  const authInfo = {
    user,
    token,
    loading,
    login,
    logout,
    signupAndRedirect,
    updateUser,
    unreadCount,
    setUnreadCount,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
