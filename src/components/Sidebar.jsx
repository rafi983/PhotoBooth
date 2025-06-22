import React, { useContext, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";
import useAxios from "../hooks/useAxios.js";
import logo from "../assets/logo-2.svg";
import { BASE_URL } from "../utils/apiConfig";

const HomeIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${
      isActive ? "stroke-zinc-900 font-bold" : "stroke-zinc-800"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const NotificationIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${
      isActive ? "stroke-zinc-900 font-bold" : "stroke-zinc-800"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const CreateIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${
      isActive ? "stroke-zinc-900 font-bold" : "stroke-zinc-800"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ProfileIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${
      isActive ? "stroke-zinc-900 font-bold" : "stroke-zinc-800"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="h-6 w-6 stroke-zinc-800"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const NavItem = ({ to, icon: Icon, children, count }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-lg transition-colors relative ${
          isActive ? "font-bold bg-gray-100" : "hover:bg-gray-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon isActive={isActive} />
          <span className="text-sm">{children}</span>
          {count > 0 && (
            <span className="absolute left-6 top-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
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
        className="flex gap-2 items-center font-medium py-4 mb-8 px-2"
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
          <Link to="/profile">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3">
                <span className="font-semibold text-sm">{user.name}</span>
                <p className="text-xs text-gray-500 leading-0">
                  @{user.email.split("@")[0]}
                </p>
              </div>
            </div>
          </Link>
          <button onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
