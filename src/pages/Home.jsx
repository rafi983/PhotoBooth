import React, { useState, useEffect, useCallback, useRef } from "react";
import useAxios from "../hooks/useAxios";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import LoginPopup from "../components/LoginPopup";
import PostList from "../components/PostList";
import { BASE_URL } from "../utils/apiConfig";

const STORAGE_KEYS = {
  POSTS: "photobooth_posts",
  PAGE: "photobooth_page",
  SCROLL_POS: "photobooth_scrollPos",
  TIMESTAMP: "photobooth_timestamp",
};

const CACHE_EXPIRY = 30 * 60 * 1000;

const saveToLocalStorage = (key, value) => {
  try {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    }
  } catch (err) {
    console.error("Error saving to localStorage:", err);
    try {
      localStorage.removeItem(key);
    } catch (clearError) {}
  }
};

const getFromLocalStorage = (key) => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    if (!timestamp || Date.now() - parseInt(timestamp) > CACHE_EXPIRY) {
      return null;
    }
    const value = localStorage.getItem(key);
    if (!value) return null;

    const parsed = JSON.parse(value);
    if (
      key === STORAGE_KEYS.POSTS &&
      (!Array.isArray(parsed) || parsed.length === 0)
    ) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    try {
      localStorage.removeItem(key);
    } catch (clearError) {}
    return null;
  }
};

const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (err) {
    console.error("Failed to clear storage:", err);
  }
};

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const api = useAxios();
  const observer = useRef();

  const getSavedState = () => {
    try {
      const savedPosts = getFromLocalStorage(STORAGE_KEYS.POSTS);
      const savedPage = getFromLocalStorage(STORAGE_KEYS.PAGE) || 1;
      const savedScrollPos = getFromLocalStorage(STORAGE_KEYS.SCROLL_POS) || 0;
      return {
        posts: Array.isArray(savedPosts) ? savedPosts : [],
        page: savedPage,
        scrollPos: savedScrollPos,
      };
    } catch (err) {
      console.error("Error loading saved state:", err);
      clearAllStorage();
      return { posts: [], page: 1, scrollPos: 0 };
    }
  };

  const {
    posts: initialPosts,
    page: initialPage,
    scrollPos: savedScrollPos,
  } = getSavedState();
  const initialFetchDoneRef = useRef(false);

  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [initialLoad, setInitialLoad] = useState(initialPosts.length === 0);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(initialPosts.length > 0);
  const hasShownPopupRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!user && !showPopup && !hasShownPopupRef.current && posts.length >= 4) {
      const elements = document.querySelectorAll(".post-card");
      if (elements.length >= 4) {
        const fourthPost = elements[3];
        const rect = fourthPost.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          setShowPopup(true);
          hasShownPopupRef.current = true;
        }
      }
    }
  }, [user, showPopup, posts.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!user) {
      hasShownPopupRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    try {
      if (posts && posts.length > 0) {
        saveToLocalStorage(STORAGE_KEYS.POSTS, posts);
      }
    } catch (err) {
      console.error("Error in post saving effect:", err);
    }
  }, [posts]);

  useEffect(() => {
    try {
      saveToLocalStorage(STORAGE_KEYS.PAGE, page);
    } catch (err) {
      console.error("Error in page saving effect:", err);
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!initialLoad && imagesLoaded && savedScrollPos > 0 && !loading) {
      const restoreScrollPosition = () => {
        window.scrollTo({
          top: savedScrollPos,
          behavior: "auto",
        });
      };
      restoreScrollPosition();
      setTimeout(restoreScrollPosition, 100);
      setTimeout(restoreScrollPosition, 500);
    }
  }, [initialLoad, imagesLoaded, savedScrollPos, loading]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (initialPosts.length > 0 && page === 1 && !initialFetchDoneRef.current) {
      setLoading(false);
      setInitialLoad(false);
      initialFetchDoneRef.current = true;
      return;
    }

    const isFirstPageLoad = page === 1 && initialFetchDoneRef.current;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        if (isFirstPageLoad) {
          setPosts([]);
          setImagesLoaded(false);
        }

        const fetcher = user ? api : axios;
        const url = user
          ? `${BASE_URL}/api/posts?page=${page}&limit=10`
          : `${BASE_URL}/api/posts`;

        const response = await fetcher.get(url);
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const validData = data.filter((post) => post && post._id);

          if (validData.length > 0) {
            const postsWithImages = validData.filter((post) => post.image);
            const postsWithoutImages = validData.filter((post) => !post.image);

            if (postsWithImages.length > 0) {
              const imagePromises = postsWithImages.map((post) => {
                return new Promise((resolve) => {
                  const img = new Image();
                  img.src = `${BASE_URL}/${post.image}`;
                  img.onload = () => resolve({ ...post, imageLoaded: true });
                  img.onerror = () =>
                    resolve({ ...post, imageLoadFailed: true });
                });
              });

              try {
                const loadedPosts = await Promise.all(
                  imagePromises.map((promise) => {
                    return Promise.race([
                      promise,
                      new Promise((resolve) =>
                        setTimeout(
                          () => resolve({ imageLoadFailed: true }),
                          10000,
                        ),
                      ),
                    ]);
                  }),
                );

                const successfullyLoadedPosts = loadedPosts.filter(
                  (post) => !post.imageLoadFailed && post._id,
                );
                const allPosts = [
                  ...successfullyLoadedPosts,
                  ...postsWithoutImages,
                ];

                setPosts((prevPosts) => {
                  if (page === 1) {
                    return user ? allPosts : allPosts.slice(0, 4);
                  } else {
                    if (user) {
                      const existingIds = new Set(prevPosts.map((p) => p._id));
                      const newPosts = allPosts.filter(
                        (p) => !existingIds.has(p._id),
                      );
                      return [...prevPosts, ...newPosts];
                    } else {
                      return allPosts.slice(0, 4);
                    }
                  }
                });
              } catch (imgError) {
                console.error("Image loading error:", imgError);
                setPosts((prevPosts) => {
                  if (page === 1) {
                    return user ? validData : validData.slice(0, 4);
                  } else {
                    if (user) {
                      const existingIds = new Set(prevPosts.map((p) => p._id));
                      const newPosts = validData.filter(
                        (p) => !existingIds.has(p._id),
                      );
                      return [...prevPosts, ...newPosts];
                    } else {
                      return validData.slice(0, 4);
                    }
                  }
                });
              }
            } else {
              setPosts((prevPosts) => {
                if (page === 1) {
                  return user ? validData : validData.slice(0, 4);
                } else {
                  if (user) {
                    const existingIds = new Set(prevPosts.map((p) => p._id));
                    const newPosts = validData.filter(
                      (p) => !existingIds.has(p._id),
                    );
                    return [...prevPosts, ...newPosts];
                  } else {
                    return validData.slice(0, 4);
                  }
                }
              });
            }

            setImagesLoaded(true);
            if (user) {
              setHasMore(data.length === 10);
            }
          } else {
            if (user) {
              setHasMore(false);
            }
            setImagesLoaded(true);
          }
        } else if (user) {
          setHasMore(false);
          setImagesLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to fetch posts. Please try again.");
        setImagesLoaded(true);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        initialFetchDoneRef.current = true;
      }
    };

    fetchPosts();
  }, [user, api, page, hasHydrated]);

  useEffect(() => {
    if (user === null) {
      clearAllStorage();
      initialFetchDoneRef.current = false;
    }
  }, [user]);

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  const guestLastPostRef = useCallback(
    (node) => {
      if (!user && posts.length === 4 && node) {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              console.log("Last post visible, showing login popup");
              setShowPopup(true);
            }
          },
          {
            threshold: 0.1,
            rootMargin: "0px 0px 150px 0px",
          },
        );

        observer.current.observe(node);
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

        {initialLoad ? (
          <Loader type="skeleton" />
        ) : (
          <>
            {posts && posts.length > 0 ? (
              <>
                <PostList
                  posts={posts}
                  user={user}
                  guestLastPostRef={guestLastPostRef}
                  authLastPostRef={authLastPostRef}
                  setShowPopup={setShowPopup}
                  onPostUpdate={handlePostUpdate}
                />
                {loading && page > 1 && <Loader type="pulse" size="medium" />}
              </>
            ) : (
              <div className="text-center py-10">
                {!loading ? (
                  <p className="text-gray-500">No posts available.</p>
                ) : (
                  <Loader type="pulse" size="medium" />
                )}
              </div>
            )}

            {!hasMore && user && posts.length > 0 && (
              <p className="text-center py-4 text-gray-400">
                You reached the end.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
