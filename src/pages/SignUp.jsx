import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import logo from "../assets/logo-2.svg";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import SuccessDialog from "../components/SuccessDialog.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";

const SignUp = () => {
  const { signupAndRedirect } = useAuth();
  const api = useAxios();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const onSubmit = async (data) => {
    setError("");

    try {
      await api.post("/auth/signup", data);
      setFormValues({
        email: data.email,
        password: data.password,
      });
      setShowSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.error || error.message || "An error occurred.",
      );
    }
  };

  const handleSuccess = async () => {
    try {
      const loginResponse = await api.post("/auth/login", {
        email: formValues.email,
        password: formValues.password,
      });

      const accessToken = loginResponse?.data?.accessToken;
      const user = loginResponse?.data?.user;
      const refreshToken = loginResponse?.data?.refreshToken;

      if (accessToken && user) {
        signupAndRedirect(user, accessToken, refreshToken);
      } else {
        navigate("/login");
      }
    } catch (error) {
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <input
                type="email"
                className={`form-input ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
                aria-label="Email"
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
            <div className="mb-2">
              <input
                type="text"
                className={`form-input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Full Name"
                aria-label="Full Name"
                {...register("name", { required: "Full name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
                aria-label="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
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
