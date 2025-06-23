import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config";
import logo from "../assets/logo-2.svg";
import useAuthStore from "../store/useAuthStore";
import useAxios from "../hooks/useAxios";
import ErrorDialog from "../components/ErrorDialog.jsx";
import toast from "react-hot-toast";
import { generateGoogleAuthPassword } from "../utils/googleAuth";

const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const api = useAxios();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const accessToken = response?.data?.accessToken;
      const user = response?.data?.user;
      const refreshToken = response?.data?.refreshToken;

      if (accessToken && user) {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        navigate("/");
      } else {
        setError("Invalid response from server. Could not log in.");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(
          err.response?.data?.error || "An error occurred during login.",
        );
      }
      toast.error("Login API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { email } = result.user;
      const googlePassword = generateGoogleAuthPassword(result.user);

      try {
        const loginResponse = await api.post("/auth/login", {
          email: email,
          password: googlePassword,
        });

        const accessToken = loginResponse?.data?.accessToken;
        const user = loginResponse?.data?.user;
        const refreshToken = loginResponse?.data?.refreshToken;

        if (accessToken && user) {
          setUser(user);
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          navigate("/");
          return;
        }
      } catch (loginErr) {
        try {
          await api.post("/auth/signup", {
            name: result.user.displayName || email.split("@")[0],
            email: email,
            password: googlePassword,
          });

          const loginResponse = await api.post("/auth/login", {
            email: email,
            password: googlePassword,
          });

          const accessToken = loginResponse?.data?.accessToken;
          const user = loginResponse?.data?.user;
          const refreshToken = loginResponse?.data?.refreshToken;

          if (accessToken && user) {
            setUser(user);
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            navigate("/");
          } else {
            setError("Failed to authenticate after Google sign-in");
          }
        } catch (signupErr) {
          setError(
            "This email is already registered but with a different method. Please use your password to login.",
          );
        }
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with the same email address.");
      } else {
        setError(
          "Failed to sign in with Google. Please try again or use email login.",
        );
        console.error("Google login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {error && <ErrorDialog message={error} onConfirm={() => setError("")} />}
      <div className="login-container rounded-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="PhotoBooth" className="h-[51px]" />
        </div>

        <div className="bg-white p-6 border border-gray-300 mb-3 rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-input ${errors.email ? "border-red-500" : ""}`}
                placeholder="Phone number, username, or email"
                aria-label="Phone number, username, or email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input pr-16 ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
                aria-label="Password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </div>

            <div className="flex justify-center mb-3">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            <div className="or-separator text-gray-500 text-sm font-semibold my-4">
              <span className="flex items-center">
                <span className="flex-1 h-px bg-gray-300 mr-4" />
                OR
                <span className="flex-1 h-px bg-gray-300 ml-4" />
              </span>
            </div>

            <div className="mb-2">
              <button
                type="button"
                className="w-full bg-blue-500 border border-gray-300 text-white hover:bg-blue-600 text-sm font-semibold py-2 px-4 rounded flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in with Google"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 border border-gray-300 text-center rounded-md">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
