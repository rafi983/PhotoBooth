import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo-2.svg";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import ErrorDialog from "../components/ErrorDialog.jsx";

const Login = () => {
  const { login } = useAuth();
  const api = useAxios();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });

      const accessToken = response?.data?.accessToken;
      const user = response?.data?.user;
      const refreshToken = response?.data?.refreshToken;

      if (accessToken && user) {
        login(user, accessToken, refreshToken);
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
      console.error("Login API Error:", err);
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
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-input"
                placeholder="Phone number, username, or email"
                aria-label="Phone number, username, or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input pr-16"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mb-4">
              <button type="submit" className="login-button">
                Log in
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
