import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config";
import logo from "../assets/logo-2.svg";
import useAuthStore from "../store/useAuthStore";
import useAxios from "../hooks/useAxios";
import SuccessDialog from "../components/SuccessDialog.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";
import toast from "react-hot-toast";
import { generateGoogleAuthPassword } from "../utils/googleAuth";

const SignUp = () => {
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
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      // First register the user
      await api.post("/auth/signup", data);

      // Immediately authenticate the user
      const loginResponse = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const accessToken = loginResponse?.data?.accessToken;
      const user = loginResponse?.data?.user;
      const refreshToken = loginResponse?.data?.refreshToken;

      if (accessToken && user) {
        // Store authentication data directly in zustand
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        // Navigate to home or profile edit
        navigate("/edit-profile");
      } else {
        setError("Failed to complete authentication process.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "An error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async () => {
    try {
      setIsLoading(true);
      const loginResponse = await api.post("/auth/login", {
        email: formValues.email,
        password: formValues.password,
      });
      const accessToken = loginResponse?.data?.accessToken;
      const user = loginResponse?.data?.user;
      const refreshToken = loginResponse?.data?.refreshToken;
      if (accessToken && user) {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        navigate("/edit-profile");
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { displayName, email } = result.user;
      const googlePassword = generateGoogleAuthPassword(result.user);
      await api.post("/auth/signup", {
        name: displayName,
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
        setError("Failed to authenticate after Google signup");
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with the same email address.");
      } else {
        setError(
          "Failed to sign up with Google. Please try again or use email registration.",
        );
        toast.error("Google signup error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-satoshi">
      {showSuccess && (
        <SuccessDialog
          title="Account Created"
          message="Your PhotoBooth account has been created successfully."
          primaryButtonText="Continue to edit profile section"
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
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </button>
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign up with Google"}
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
