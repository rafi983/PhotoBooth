import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import logo from "../assets/logo-2.svg";
import useAxios from "../hooks/useAxios";
import ErrorDialog from "../components/ErrorDialog.jsx";
import InstructionModal from "../components/InstructionModal.jsx";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const api = useAxios();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });

      setIsSubmitted(true);
      setShowInstructionsModal(true);
      toast.success("Password reset instructions have been sent");
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-3xl shadow-2xl p-8 backdrop-blur-md animate-fade-in">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-14 mb-6 drop-shadow-lg" />
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-pink-600 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-center text-gray-500 mt-2">
            Enter your email to receive reset instructions
          </p>
        </div>

        {error && <ErrorDialog message={error} onClose={() => setError("")} />}

        {isSubmitted ? (
          <div className="bg-pink-50 p-6 rounded-xl shadow-inner">
            <p className="text-center text-gray-700">
              If an account exists with the provided email, you will receive
              password reset instructions. Please check your email (or the
              server console for demo purposes).
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/login"
                className="text-sm text-pink-600 hover:text-pink-800 font-medium transition"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                    errors.email ? "border-pink-400" : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                  placeholder="Email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-pink-500 text-xs mt-1">
                    {errors.email.message}
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
                  "Send Reset Instructions"
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
        )}
      </div>

      <InstructionModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
      >
        <div className="space-y-4">
          <h4 className="font-medium text-pink-600">
            Development Environment Instructions
          </h4>
          <p>
            Since we're in a development environment, follow these steps to
            reset your password:
          </p>

          <ol className="list-decimal ml-5 space-y-2">
            <li>
              Check your{" "}
              <span className="font-semibold text-pink-600">
                backend server console
              </span>{" "}
              for a message like:
              <div className="bg-pink-100 p-2 mt-1 rounded font-mono text-sm">
                Reset token for example@email.com: YOUR_TOKEN_HERE
              </div>
            </li>
            <li>Copy the token value (the part after the colon)</li>
            <li>
              Use this token in one of the following ways:
              <ul className="list-disc ml-5 mt-1">
                <li>
                  Navigate to:{" "}
                  <code className="bg-pink-100 px-1 rounded">
                    localhost:5173/reset-password?token=YOUR_TOKEN_HERE
                  </code>
                </li>
                <li>
                  Or click the button below after the token appears in the
                  console
                </li>
              </ul>
            </li>
          </ol>

          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mt-2 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-pink-400"
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
                <p className="text-sm text-pink-700">
                  In a production environment, this token would be sent via
                  email with a clickable link.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            After entering your new password on the reset page, you'll be
            redirected to the login page where you can sign in with your new
            credentials.
          </p>
        </div>
      </InstructionModal>
    </div>
  );
};

export default ForgotPassword;
