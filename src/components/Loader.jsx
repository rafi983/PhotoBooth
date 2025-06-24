import React from "react";

const Loader = ({ type = "default", size = "medium" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  switch (type) {
    case "pulse":
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-pink-500 to-pink-300 animate-pulse`}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-pink-300 animate-ping opacity-50"
              style={{ animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="mt-4 text-gray-500 animate-pulse">Loading posts...</p>
        </div>
      );

    case "dots":
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex space-x-2">
            <div
              className={`bg-pink-500 rounded-full animate-bounce ${size === "small" ? "w-2 h-2" : size === "medium" ? "w-3 h-3" : "w-4 h-4"}`}
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className={`bg-pink-400 rounded-full animate-bounce ${size === "small" ? "w-2 h-2" : size === "medium" ? "w-3 h-3" : "w-4 h-4"}`}
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className={`bg-pink-300 rounded-full animate-bounce ${size === "small" ? "w-2 h-2" : size === "medium" ? "w-3 h-3" : "w-4 h-4"}`}
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      );

    case "skeleton":
      return (
        <div className="w-full space-y-4 py-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="mt-4 h-40 bg-gray-100 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
      );

    case "logo":
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 border-r-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full opacity-30"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full text-pink-500">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-500 animate-pulse">
            Loading PhotoBooth...
          </p>
        </div>
      );

    default:
      // Enhanced version of the original loader
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className={`${sizeClasses[size]} border-4 border-gray-200 border-t-pink-500 border-r-pink-400 rounded-full animate-spin shadow-lg`}
          ></div>
          <p className="mt-4 text-gray-500 font-medium">Loading content...</p>
        </div>
      );
  }
};

export default Loader;
