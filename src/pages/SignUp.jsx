import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getAuth,
  getRedirectResult,
} from "firebase/auth";
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

      // Try to use popup first, but fallback to redirect if it fails
      try {
        const result = await signInWithPopup(auth, provider);
        await processGoogleUser(result.user);
      } catch (popupError) {
        console.log(
          "Popup blocked or failed, falling back to redirect",
          popupError,
        );
        // If popup is blocked or fails for any reason, use redirect instead
        // We'll handle the redirect result in the useEffect
        const auth = getAuth();
        await signInWithRedirect(auth, provider);
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
        console.error("Google signup error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process Google user
  const processGoogleUser = async (user) => {
    if (!user?.email) {
      setError("Could not get email from Google account");
      return;
    }

    try {
      const { displayName, email } = user;
      const googlePassword = generateGoogleAuthPassword(user);

      await api.post("/auth/signup", {
        name: displayName || "Google User",
        email: email,
        password: googlePassword,
      });

      const loginResponse = await api.post("/auth/login", {
        email: email,
        password: googlePassword,
      });

      const accessToken = loginResponse?.data?.accessToken;
      const userData = loginResponse?.data?.user;
      const refreshToken = loginResponse?.data?.refreshToken;

      if (accessToken && userData) {
        setUser(userData);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        // Force a delay before navigation to ensure state is updated
        setTimeout(() => {
          navigate("/edit-profile");
          toast.success(`Welcome to PhotoBooth, ${userData.name}!`);
        }, 100);
      } else {
        setError("Failed to authenticate after Google signup");
      }
    } catch (err) {
      console.error("Error processing Google user:", err);
      setError("Failed to process Google authentication. Please try again.");
    }
  };

  // Handle redirect result for Google sign-in
  useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const { displayName, email } = result.user;
          const googlePassword = generateGoogleAuthPassword(result.user);
          // Automatically sign up and log in the user
          api
            .post("/auth/signup", {
              name: displayName,
              email: email,
              password: googlePassword,
            })
            .then(() => {
              return api.post("/auth/login", {
                email: email,
                password: googlePassword,
              });
            })
            .then((loginResponse) => {
              const accessToken = loginResponse?.data?.accessToken;
              const user = loginResponse?.data?.user;
              const refreshToken = loginResponse?.data?.refreshToken;
              if (accessToken && user) {
                setUser(user);
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                navigate("/edit-profile");
              }
            })
            .catch((err) => {
              setError("Failed to complete Google authentication.");
              console.error(err);
            });
        }
      })
      .catch((error) => {
        console.log("Error getting redirect result:", error);
      });
  }, [api, navigate, setAccessToken, setRefreshToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white to-pink-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-3xl shadow-2xl p-8 backdrop-blur-md animate-fade-in">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="h-16 mb-6 drop-shadow-lg animate-pulse"
            />
          </Link>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Join PhotoBooth
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Sign up to see photos and videos from your friends
          </p>
        </div>

        {error && (
          <ErrorDialog message={error} onConfirm={() => setError("")} />
        )}
        {showSuccess && (
          <SuccessDialog
            title="Account Created"
            message="Your PhotoBooth account has been created successfully."
            primaryButtonText="Continue to edit profile section"
            onPrimaryButtonClick={handleSuccess}
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border ${
                    errors.email ? "border-pink-400" : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                  placeholder="Email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border ${
                    errors.name ? "border-pink-400" : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                  placeholder="Full name"
                  {...register("name", { required: "Full name is required" })}
                />
              </div>
              {errors.name && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 px-4 py-3 border ${
                    errors.password ? "border-pink-400" : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:z-10 sm:text-base transition`}
                  placeholder="Password"
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 hover:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 active:shadow"
            >
              {isLoading ? (
                <span className="animate-pulse">Creating account...</span>
              ) : (
                "Sign up"
              )}
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 text-base font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 active:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0407269,18.0125889 C14.9509167,18.7163129 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                />
                <path
                  fill="#4A90E2"
                  d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-pink-500 hover:text-pink-700 transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
