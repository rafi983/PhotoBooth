import React, { useContext, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";
import useAxios from "../hooks/useAxios.js";
import logo from "../assets/logo-2.svg";
import { BASE_URL } from "../utils/apiConfig";

import {
  HomeIcon,
  NotificationIcon,
  CreateIcon,
  ProfileIcon,
  LogoutIcon,
} from "./Icons.jsx";

const NavItem = ({ to, icon: Icon, children, count }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-lg transition-colors relative ${
          isActive
            ? "font-bold bg-pink-100 text-pink-600"
            : "text-pink-500 hover:bg-pink-50 hover:text-pink-600"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon isActive={isActive} />
          <span className="text-sm">{children}</span>
          {count > 0 && (
            <span className="absolute left-6 top-1 h-5 min-w-[20px] px-1 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  </li>
);

const Sidebar = () => {
  const { user, logout, unreadCount, setUnreadCount } = useContext(AuthContext);
  const navigate = useNavigate();
  const api = useAxios();

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (Array.isArray(response.data)) {
          const newUnreadCount = response.data.filter(
            (notification) => !notification.isRead,
          ).length;
          setUnreadCount(newUnreadCount);
        }
      } catch (error) {
        console.error("Failed to poll for notifications:", error);
      }
    };

    checkNotifications();
    const intervalId = setInterval(checkNotifications, 15000);

    return () => clearInterval(intervalId);
  }, [user, api, setUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarUrl = user?.avatar
    ? `${BASE_URL}/${user.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`;

  return (
    <aside className="hidden floating-navbar bg-white border-r border-gray-200 px-4 py-6 md:flex flex-col">
      <Link
        to="/"
        className="flex gap-2 items-center font-medium py-4 mb-8 px-2 text-pink-600"
      >
        <img src={logo} alt="PhotoBooth" className="h-8 object-contain" />
        <h2 className="text-xl">Photo Booth</h2>
      </Link>

      <ul className="space-y-4 flex-1">
        <NavItem to="/" icon={HomeIcon}>
          Home
        </NavItem>
        <NavItem
          to="/notifications"
          icon={NotificationIcon}
          count={unreadCount}
        >
          Notifications
        </NavItem>
        <NavItem to="/create-post" icon={CreateIcon}>
          Create
        </NavItem>
        <NavItem to="/profile" icon={ProfileIcon}>
          Profile
        </NavItem>
      </ul>

      {user && (
        <div className="flex justify-between items-center mt-auto">
          <Link to="/profile" className="hover:text-pink-600 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3">
                <span className="font-semibold text-sm text-pink-500">
                  {user.name}
                </span>
                <p className="text-xs text-pink-500 leading-0">
                  @{user.email.split("@")[0]}
                </p>
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Logout"
            className="hover:bg-pink-50 p-2 rounded-full transition-colors"
          >
            <LogoutIcon />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
