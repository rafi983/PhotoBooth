import axios from "axios";
import { useMemo } from "react";
import useAuthStore from "../store/useAuthStore";
import { BASE_URL } from "../utils/apiConfig.js";

const useAxios = () => {
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

        if (
          error.response &&
          error.response.status === 401 &&
          refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const refreshTokenToUse =
              refreshToken || localStorage.getItem("refreshToken");

            if (!refreshTokenToUse) {
              logout();
              return Promise.reject(error);
            }

            const res = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
              refreshToken: refreshTokenToUse,
            });

            const { accessToken: newAccessToken, user } = res.data;
            const newRefreshToken = res.data.refreshToken || refreshTokenToUse;

            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            setUser(user);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
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
