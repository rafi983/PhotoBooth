import React, { useState, useEffect, useCallback, useRef } from "react";
import useAxios from "../hooks/useAxios";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import LoginPopup from "../components/LoginPopup";
import PostList from "../components/PostList";
import { BASE_URL } from "../utils/apiConfig";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const api = useAxios();
  const observer = useRef();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");

      const fetcher = user ? api : axios;
      const url = user
        ? `${BASE_URL}/api/posts?page=${page}&limit=10`
        : `${BASE_URL}/api/posts`;

      try {
        const response = await fetcher.get(url);
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const imagePromises = data
            .filter((post) => post.image)
            .map((post) => {
              return new Promise((resolve) => {
                const img = new Image();
                img.src = `${BASE_URL}/${post.image}`;
                img.onload = () => resolve();
                img.onerror = () => resolve();
              });
            });

          await Promise.all(imagePromises);

          setPosts((prevPosts) => {
            if (user) {
              const existingIds = new Set(prevPosts.map((p) => p._id));
              const newPosts = data.filter((p) => !existingIds.has(p._id));
              return [...prevPosts, ...newPosts];
            } else {
              return data.slice(0, 4);
            }
          });

          if (user) {
            setHasMore(data.length === 10);
          }
        } else if (user) {
          setHasMore(false);
        }
      } catch (err) {
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, api, page]);

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  const guestLastPostRef = useCallback(
    (node) => {
      if (!user && posts.length === 4) {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            setShowPopup(true);
          }
        });
        if (node) observer.current.observe(node);
      }
    },
    [user, posts.length],
  );

  const authLastPostRef = useCallback(
    (node) => {
      if (!user || loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [user, loading, hasMore],
  );

  return (
    <div className="md:flex">
      {showPopup && <LoginPopup setShowPopup={setShowPopup} />}
      <Sidebar />
      <div className="max-w-xl mx-auto w-full py-10">
        {error && <div className="text-center text-red-500 p-4">{error}</div>}

        <PostList
          posts={posts}
          user={user}
          guestLastPostRef={guestLastPostRef}
          authLastPostRef={authLastPostRef}
          setShowPopup={setShowPopup}
          onPostUpdate={handlePostUpdate}
        />

        {loading && <Loader />}
        {!hasMore && user && (
          <p className="text-center py-4 text-gray-400">You reached the end.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
