import axios from "axios";
import { useMemo } from "react";
import useAuthStore from "../store/useAuthStore";
import { BASE_URL } from "../utils/apiConfig.js";

const useAxios = () => {
  // Get authentication state from zustand store
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const instance = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: `${BASE_URL}/api`,
    });

    axiosInstance.interceptors.request.use(
      (config) => {
        // Try zustand token first, fall back to direct localStorage access
        const token = accessToken || localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized - token expired)
        if (
          error.response &&
          error.response.status === 401 &&
          refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            // Try zustand refreshToken first, fall back to direct localStorage
            const refreshTokenToUse =
              refreshToken || localStorage.getItem("refreshToken");

            if (!refreshTokenToUse) {
              // No refresh token available, force logout
              logout();
              return Promise.reject(error);
            }

            const res = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
              refreshToken: refreshTokenToUse,
            });

            const { accessToken: newAccessToken, user } = res.data;
            const newRefreshToken = res.data.refreshToken || refreshTokenToUse;

            // Update both zustand and localStorage
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            setUser(user);

            // Update request headers
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Clear authentication state on refresh failure
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return axiosInstance;
  }, [
    accessToken,
    refreshToken,
    logout,
    setUser,
    setAccessToken,
    setRefreshToken,
  ]);

  return instance;
};

export default useAxios;
