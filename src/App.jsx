import React from "react";
import { Routes, Route } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import EditPost from "./pages/EditPost.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/post/:id"
        element={
          <PrivateRoute>
            <PostDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <PrivateRoute>
            <CreatePost />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-post/:id"
        element={
          <PrivateRoute>
            <EditPost onPostUpdate={handlePostUpdate} />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:profileId"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
