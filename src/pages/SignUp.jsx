import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo-2.svg";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import SuccessDialog from "../components/SuccessDialog.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";

const SignUp = () => {
  const { signupAndRedirect } = useAuth();
  const api = useAxios();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.name || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await api.post("/auth/signup", formData);
      setShowSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "An error occurred.",
      );
    }
  };

  const handleSuccess = async () => {
    try {
      const loginResponse = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const accessToken = loginResponse?.data?.accessToken;
      const user = loginResponse?.data?.user;
      const refreshToken = loginResponse?.data?.refreshToken;

      if (accessToken && user) {
        signupAndRedirect(user, accessToken, refreshToken);
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-satoshi">
      {showSuccess && (
        <SuccessDialog
          title="Account Created"
          message="Your PhotoBooth account has been created successfully."
          primaryButtonText="Continue to Feed"
          onPrimaryButtonClick={handleSuccess}
        />
      )}
      {error && <ErrorDialog message={error} onConfirm={() => setError("")} />}
      <div className="signup-container max-w-sm w-full mx-auto">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="PhotoBooth" className="h-[51px]" />
        </div>

        <div className="bg-white p-6 border border-gray-300 mb-3">
          <h2 className="text-center font-semibold text-gray-500 text-lg mb-4">
            Sign up to see photos and videos from your friends.
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Email"
                aria-label="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Full Name"
                aria-label="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mb-2">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm py-2 px-4 rounded"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 border border-gray-300 text-center rounded-md">
          <p className="text-sm">
            Have an account?{" "}
            <Link to="/login" className="text-blue-500 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
