import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import useAxios from "../hooks/useAxios.js";
import useAuthStore from "../store/useAuthStore";
import { BASE_URL } from "../utils/apiConfig.js";
import Loader from "../components/Loader.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";
import toast from "react-hot-toast";

const getDeadNotificationIds = () => {
  const ids = localStorage.getItem("dead_notification_ids");
  return ids ? JSON.parse(ids) : [];
};

const addDeadNotificationId = (id) => {
  const ids = getDeadNotificationIds();
  if (!ids.includes(id)) {
    localStorage.setItem("dead_notification_ids", JSON.stringify([...ids, id]));
  }
};

const groupNotifications = (notifications) => {
  const groups = {
    Today: [],
    "This Week": [],
    Earlier: [],
  };
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    const diffTime = now.getTime() - notificationDate.getTime();
    if (diffTime < oneDay) {
      groups.Today.push(notification);
    } else if (diffTime < sevenDays) {
      groups["This Week"].push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });
  return groups;
};

const NotificationItem = ({ notification, onRemove }) => {
  const navigate = useNavigate();
  const api = useAxios();

  const handleNotificationClick = async () => {
    try {
      await api.get(`/posts/${notification.postId}`);
      navigate(`/post/${notification.postId}`);
    } catch (error) {
      toast.error("The associated post has been deleted.");
      onRemove(notification._id);
    }
  };

  const message =
    notification.type === "like"
      ? "liked your photo."
      : "commented on your photo.";

  const timeAgo = new Date(notification.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const avatarUrl = notification.fromUser?.avatar
    ? `${BASE_URL}/${notification.fromUser.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${notification.fromUser?.name}`;

  return (
    <div
      onClick={handleNotificationClick}
      className="notification-item flex items-center p-4 border-b border-gray-100 cursor-pointer"
    >
      <div className="relative mr-3">
        <div className="w-11 h-11 rounded-full overflow-hidden">
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex-1 mr-3">
        <p className="text-sm">
          <span className="font-semibold">
            {notification.fromUser?.name || "A user"}
          </span>{" "}
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const api = useAxios();
  const currentUser = useAuthStore((state) => state.user);

  const handleRemoveNotification = (idToRemove) => {
    addDeadNotificationId(idToRemove);
    setNotifications((current) => current.filter((n) => n._id !== idToRemove));
  };

  useEffect(() => {
    const fetchAndFilterNotifications = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/notifications");
        const rawNotifications = Array.isArray(response.data)
          ? response.data
          : [];

        const validationChecks = await Promise.allSettled(
          rawNotifications.map((n) =>
            api
              .get(`/posts/${n.postId}`)
              .then((postResponse) => {
                const post = postResponse.data;

                if (n.type === "like") {
                  const isLikeStillValid = post.likes.some(
                    (like) => like?._id === n.fromUser?._id,
                  );
                  return isLikeStillValid ? n : null;
                }

                if (n.type === "comment") {
                  const isCommentStillValid = post.comments.some(
                    (comment) => comment.user?._id === n.fromUser?._id,
                  );
                  return isCommentStillValid ? n : null;
                }

                return n;
              })
              .catch(() => {
                addDeadNotificationId(n._id);
                return null;
              }),
          ),
        );

        const liveNotifications = validationChecks
          .map((res) => (res.status === "fulfilled" ? res.value : null))
          .filter(Boolean);

        const uniqueNotifications = [];
        const seenLikes = new Set();

        for (const notification of liveNotifications) {
          if (notification.type === "like") {
            const likeKey = `${notification.fromUser?._id}-${notification.postId}`;
            if (!seenLikes.has(likeKey)) {
              uniqueNotifications.push(notification);
              seenLikes.add(likeKey);
            }
          } else {
            uniqueNotifications.push(notification);
          }
        }

        setNotifications(uniqueNotifications);
      } catch (err) {
        setError("Could not fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAndFilterNotifications();
    }
  }, [api, currentUser]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const markAsRead = async () => {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);

      if (unreadIds.length > 0) {
        try {
          await Promise.all(
            unreadIds.map((id) => api.patch(`/notifications/${id}/read`)),
          );
          // If you need setUnreadCount globally, add it to zustand store and use here
          // setUnreadCount(0);
        } catch (error) {
          console.error("Failed to mark notifications as read", error);
        }
      }
    };

    markAsRead();
  }, [notifications, api]);

  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className="md:flex bg-white">
      <Sidebar />
      <div className="notifications-container w-full">
        {error && (
          <ErrorDialog message={error} onConfirm={() => setError("")} />
        )}
        <header className="sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold">Notifications</h1>
          </div>
        </header>

        {loading ? (
          <div className="mt-20">
            <Loader />
          </div>
        ) : (
          <div className="notifications-list">
            {Object.keys(groupedNotifications).map(
              (groupName) =>
                groupedNotifications[groupName].length > 0 && (
                  <Section title={groupName} key={groupName}>
                    {groupedNotifications[groupName].map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onRemove={handleRemoveNotification}
                      />
                    ))}
                  </Section>
                ),
            )}
            {notifications.length === 0 && !error && (
              <p className="text-center text-gray-500 p-8">
                You have no new notifications.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <>
    <div className="px-4 py-3 border-b border-gray-100">
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
    {children}
  </>
);

export default Notifications;
