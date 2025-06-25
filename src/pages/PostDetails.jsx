import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import useAuthStore from "../store/useAuthStore";
import Sidebar from "../components/Sidebar.jsx";
import { BASE_URL } from "../utils/apiConfig.js";
import toast from "react-hot-toast";
import Loader from "../components/Loader.jsx";
import {
  LikeIcon,
  LikeIconFilled,
  CommentIcon,
  SendIcon,
  EditIcon,
  TrashIcon,
} from "../components/Icons.jsx";
import ShareButton from "../components/ShareButton.jsx";
import LikesModal from "../components/LikesModal.jsx";

const PostDetails = () => {
  const { id } = useParams();
  const api = useAxios();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [morePosts, setMorePosts] = useState([]);
  const [showLikesModal, setShowLikesModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
        if (res.data?.user?._id) {
          fetchMorePosts(res.data.user._id, res.data._id);
        }
      } catch {
        toast.error("Failed to load post");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    // eslint-disable-next-line
  }, [id, api, navigate]);

  const fetchMorePosts = async (userId, excludeId) => {
    try {
      const res = await api.get(`/posts/user/${userId}`);
      const filtered = res.data.posts
        .filter((p) => p._id !== excludeId && p.image)
        .map((p) => ({ ...p, image: p.image.replace(/\\/g, "/") }));
      setMorePosts(filtered);
    } catch {
      toast.error("Failed to fetch more posts");
    }
  };

  const handleLike = async () => {
    const isLiked = post.likes.some((like) => like?._id === currentUser?._id);
    const originalPost = { ...post };
    const newLikes = isLiked
      ? post.likes.filter((like) => like?._id !== currentUser._id)
      : [...post.likes, currentUser];

    setPost({ ...post, likes: newLikes });

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      const updatedPost = await api.get(`/posts/${post._id}`);
      setPost(updatedPost.data);

      try {
        const cachedPosts =
          JSON.parse(localStorage.getItem("photobooth_posts")) || [];
        const updatedPosts = cachedPosts.map((p) =>
          p._id === post._id ? { ...p, likes: updatedPost.data.likes } : p,
        );
        localStorage.setItem("photobooth_posts", JSON.stringify(updatedPosts));
      } catch (err) {
        console.error("Error updating cache:", err);
      }
    } catch (err) {
      setPost(originalPost);
      toast.error("Failed to like post");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/posts/${post._id}/comment`, { text: comment });
      setComment("");
      const res = await api.get(`/posts/${post._id}`);
      setPost(res.data);
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await api.patch(`/posts/comment/${commentId}`, { text: editingText });
      const res = await api.get(`/posts/${post._id}`);
      setPost(res.data);
      setEditingCommentId(null);
      setEditingText("");
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/comment/${commentId}`);
      const res = await api.get(`/posts/${post._id}`);
      setPost(res.data);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  if (loading || !post) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-container flex-1 flex justify-center items-center h-screen">
          <Loader />
        </main>
      </div>
    );
  }

  const isLiked = post.likes?.some((l) => l._id === currentUser?._id);
  const isOwner = currentUser?._id === post.user?._id;
  const postDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="main-container flex-1 bg-gradient-to-tr from-white to-pink-50 p-4 md:p-8 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden md:max-h-[85vh] animate-fadeIn">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center">
            <img
              src={`${BASE_URL}/${post.image}`}
              alt={post.caption}
              className="max-h-[50vh] md:max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/profile/${post.user?._id}`}
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-100 hover:ring-pink-300 transition-all duration-300"
                  >
                    <img
                      src={
                        post.user?.avatar
                          ? `${BASE_URL}/${post.user.avatar}`
                          : `https://api.dicebear.com/8.x/initials/svg?seed=${post.user?.name}`
                      }
                      className="w-full h-full object-cover"
                      alt={post.user?.name}
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/profile/${post.user?._id}`}
                      className="font-medium text-gray-800 hover:text-pink-600 transition-colors duration-200 block"
                    >
                      {post.user?.name || "Unknown User"}
                    </Link>
                    <p className="text-xs text-gray-500">{postDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShareButton postId={post._id} />

                  {isOwner && (
                    <>
                      <button
                        onClick={() => navigate(`/edit-post/${post._id}`)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit post"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete post"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-5 max-h-[50vh] md:max-h-none custom-scrollbar">
              {/* Caption */}
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                <img
                  src={
                    post.user?.avatar
                      ? `${BASE_URL}/${post.user.avatar}`
                      : `https://api.dicebear.com/8.x/initials/svg?seed=${post.user?.name}`
                  }
                  className="w-10 h-10 rounded-full object-cover mt-1 shrink-0"
                  alt={post.user?.name}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <Link
                      to={`/profile/${post.user?._id}`}
                      className="font-medium text-gray-800 hover:text-pink-600 transition-colors mr-2"
                    >
                      {post.user?.name}
                    </Link>
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-700">
                    Comments ({post.comments?.length || 0})
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className="flex items-center gap-1.5 text-gray-700 hover:text-pink-600 transition-colors group"
                      aria-label={isLiked ? "Unlike post" : "Like post"}
                    >
                      <span className="transform group-hover:scale-110 transition-transform duration-200">
                        {isLiked ? (
                          <LikeIconFilled className="w-5 h-5 text-pink-600" />
                        ) : (
                          <LikeIcon className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        post.likes.length > 0 && setShowLikesModal(true)
                      }
                      className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>
                        {post.likes.length}{" "}
                        {post.likes.length === 1 ? "like" : "likes"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <Link
                        to={`/profile/${comment.user?._id}`}
                        className="shrink-0"
                      >
                        <img
                          src={
                            comment.user?.avatar
                              ? `${BASE_URL}/${comment.user.avatar}`
                              : `https://api.dicebear.com/8.x/initials/svg?seed=${comment.user?.name}`
                          }
                          className="w-8 h-8 rounded-full object-cover"
                          alt={comment.user?.name}
                        />
                      </Link>
                      <div className="flex-1">
                        {editingCommentId === comment._id ? (
                          <div className="flex flex-col">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full text-sm p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                              rows="3"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditComment(comment._id)}
                                className="px-3 py-1 text-xs bg-pink-500 text-white hover:bg-pink-600 rounded-md transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  to={`/profile/${comment.user?._id}`}
                                  className="font-medium text-gray-800 hover:text-pink-600 transition-colors text-sm"
                                >
                                  {comment.user?.name}
                                </Link>
                                <p className="text-sm text-gray-600 mt-1 break-words">
                                  {comment.text}
                                </p>
                              </div>
                              {comment.user?._id === currentUser?._id && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment._id);
                                      setEditingText(comment.text);
                                    }}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <div className="shrink-0 p-4 border-t border-gray-100">
              <form
                onSubmit={handleCommentSubmit}
                className="flex gap-3 items-center"
              >
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow text-sm bg-gray-50 border border-gray-100 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200 rounded-full py-3 px-4 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className={`p-3 rounded-full transition-colors ${
                    comment.trim()
                      ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            More from {post.user?.name}
          </h2>
          {morePosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {morePosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  to={`/post/${relatedPost._id}`}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow hover:opacity-90"
                >
                  <img
                    src={`${BASE_URL}/${relatedPost.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/90 rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-600">
                {post.user?.name} hasn't shared any other posts yet.
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showLikesModal && (
          <LikesModal
            users={post.likes}
            onClose={() => setShowLikesModal(false)}
          />
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg text-gray-800">Delete Post</h3>
              <p className="py-4 text-gray-600">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostDetails;
