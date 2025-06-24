import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import logo from "../assets/logo-2.svg";
import useAxios from "../hooks/useAxios";
import ErrorDialog from "../components/ErrorDialog.jsx";
import InstructionModal from "../components/InstructionModal.jsx";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const api = useAxios();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(!token);

  const password = watch("newPassword");

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      if (!token) {
        setError("Invalid or missing reset token");
        return;
      }

      await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });

      toast.success("Password has been reset successfully");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full space-y-8 bg-white/90 rounded-3xl shadow-2xl p-8 backdrop-blur-md animate-fade-in">
          <div className="flex flex-col items-center">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-14 mb-6 drop-shadow-lg" />
            </Link>
            <h2 className="text-center text-3xl font-extrabold text-pink-600">
              Reset Password
            </h2>
          </div>

          <div className="bg-pink-50 p-6 rounded-xl shadow-inner">
            <p className="text-center text-pink-500">
              Invalid or missing password reset token
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/forgot-password"
                className="text-sm text-pink-600 hover:text-pink-800 font-medium transition"
              >
                Request a new password reset
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-3xl shadow-2xl p-8 backdrop-blur-md animate-fade-in">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-14 mb-6 drop-shadow-lg" />
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-pink-600 tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-center text-gray-500 mt-2">
            Enter your new password below
          </p>
        </div>

        {error && <ErrorDialog message={error} onClose={() => setError("")} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                    errors.newPassword ? "border-pink-400" : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                  placeholder="New password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="text-gray-500">Hide</span>
                  ) : (
                    <span className="text-gray-500">Show</span>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                  errors.confirmPassword ? "border-pink-400" : "border-gray-300"
                } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                placeholder="Confirm password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/login"
              className="text-sm text-pink-500 hover:text-pink-700 font-medium transition"
            >
              Back to login
            </Link>
          </div>
        </form>

        {/* Instruction modal for development */}
        <InstructionModal
          isOpen={showInstructionsModal}
          onClose={() => setShowInstructionsModal(false)}
        >
          <div className="space-y-4">
            <h4 className="font-medium text-blue-600">Missing Reset Token</h4>
            <p>
              It looks like you're trying to access the password reset page
              without a token. In development, follow these steps:
            </p>

            <ol className="list-decimal ml-5 space-y-2">
              <li>
                Go to the{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  login page
                </Link>
              </li>
              <li>Click "Forgot password?"</li>
              <li>Enter your email address</li>
              <li>Check the backend server console for your reset token</li>
              <li>
                Use the token by navigating to:
                <div className="bg-gray-100 p-2 mt-1 rounded font-mono text-sm">
                  localhost:5173/reset-password?token=YOUR_TOKEN_FROM_CONSOLE
                </div>
              </li>
            </ol>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    In a production environment, you would click a link in your
                    email that would bring you directly to this page with the
                    token.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              If you've already requested a token, make sure to include it in
              the URL as shown above.
            </p>
          </div>
        </InstructionModal>
      </div>
    </div>
  );
};

export default ResetPassword;
