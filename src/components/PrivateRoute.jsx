import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Loader from "./Loader.jsx"; // Assuming you have this component

const PrivateRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
