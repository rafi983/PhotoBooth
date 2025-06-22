import axios from "axios";
import { useContext, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { BASE_URL } from "../utils/apiConfig.js";

const useAxios = () => {
  const { logout, login } = useContext(AuthContext);

  const instance = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: `${BASE_URL}/api`,
    });

    axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const refreshToken = localStorage.getItem("refreshToken");

        if (
          error.response &&
          error.response.status === 401 &&
          refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
              refreshToken,
            });

            const { accessToken, user } = res.data;
            const newRefreshToken = res.data.refreshToken || refreshToken;

            localStorage.setItem("token", accessToken);

            if (res.data.refreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            login(user, accessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
  }, [logout, login]);

  return instance;
};

export default useAxios;
