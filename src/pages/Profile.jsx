import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import useAuth from "../hooks/useAuth.js";
import useAxios from "../hooks/useAxios.js";
import { BASE_URL } from "../utils/apiConfig.js";
import Loader from "../components/Loader.jsx";

const Profile = () => {
  const { user: loggedInUser } = useAuth();
  const { profileId } = useParams();
  const api = useAxios();

  const [profileInfo, setProfileInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getUsernameFromEmail = (email) => email?.split("@")[0];

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError("");

      try {
        const targetUserId = profileId || loggedInUser._id;

        if (targetUserId) {
          const response = await api.get(`/posts/user/${targetUserId}`);
          if (response.data) {
            setProfileInfo(response.data.user);
            setPosts(response.data.posts || []);
          }
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?._id) {
      fetchProfileData();
    }
  }, [profileId, loggedInUser, api]);

  const isOwnProfile = !profileId || profileId === loggedInUser?._id;

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-container flex-1 flex justify-center items-center">
          <Loader />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-container flex-1 p-4 text-center text-red-500">
          {error}
        </main>
      </div>
    );
  }

  if (!profileInfo) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-container flex-1 p-4 text-center">
          Profile not found.
        </main>
      </div>
    );
  }

  const profileAvatarUrl = profileInfo.avatar
    ? `${BASE_URL}/${profileInfo.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${profileInfo.name}`;

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-container flex-1 p-4">
        <div className="profile-container">
          <div className="flex flex-col md:flex-row mb-10">
            <div className="flex justify-center md:w-1/3 mb-6 md:mb-0">
              <img
                src={profileAvatarUrl}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border"
              />
            </div>
            <div className="md:w-2/3 md:ml-10 text-center md:text-left">
              {/* Name and Username on same line */}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1">
                <h2 className="text-2xl font-semibold">{profileInfo.name}</h2>
                <p className="text-sm text-gray-500">
                  @{getUsernameFromEmail(profileInfo.email)}
                </p>
              </div>

              {/* Edit Profile button below */}
              {isOwnProfile && (
                <div className="mb-4">
                  <Link
                    to="/edit-profile"
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-sm font-medium px-4 py-1.5 rounded-md transition"
                  >
                    Edit profile
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6 sm:space-x-10 mb-4 text-sm">
                <span>
                  <strong className="font-semibold">{posts.length}</strong>{" "}
                  posts
                </span>
                <span>
                  <strong className="font-semibold">0</strong> followers
                </span>
                <span>
                  <strong className="font-semibold">0</strong> following
                </span>
              </div>

              {/* Bio + Website */}
              <div className="text-sm space-y-1">
                {profileInfo.bio && (
                  <p className="whitespace-pre-line">{profileInfo.bio}</p>
                )}
                {profileInfo.website && (
                  <a
                    href={profileInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-medium hover:underline break-words"
                  >
                    {profileInfo.website}
                  </a>
                )}
              </div>
            </div>
          </div>
          <section>
            <h3 className="font-semibold text-lg mb-4 border-t pt-4">Posts</h3>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post._id} to={`/post/${post._id}`}>
                    <img
                      src={`${BASE_URL}/${post.image}`}
                      alt={`Post by ${profileInfo.name}`}
                      className="grid-image"
                    />
                  </Link>
                ))
              ) : (
                <p>No posts yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
