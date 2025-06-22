import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
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
  const { user: currentUser } = useAuth();

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
    try {
      await api.post(`/posts/${post._id}/like`);
      const res = await api.get(`/posts/${post._id}`);
      setPost(res.data);
    } catch {
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
      <main className="main-container flex-1 bg-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto bg-[#F8F9FA] rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
            <img
              src={`${BASE_URL}/${post.image}`}
              alt={post.caption}
              className="max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="p-6 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      post.user?.avatar
                        ? `${BASE_URL}/${post.user.avatar}`
                        : `https://api.dicebear.com/8.x/initials/svg?seed=${post.user?.name}`
                    }
                    className="w-12 h-12 rounded-full object-cover"
                    alt={post.user?.name}
                  />
                  <div>
                    <Link
                      to={`/profile/${post.user?._id}`}
                      className="font-bold text-base text-[#212529] hover:underline"
                    >
                      {post.user?.name || "Unknown User"}
                    </Link>
                    <p className="text-xs text-[#6C757D]">{postDate}</p>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                      className="text-[#6C757D] hover:text-blue-600"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-[#6C757D] hover:text-red-500"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 border-y border-[#E9ECEF] space-y-4">
              {/* Caption */}
              <div className="flex items-start gap-4">
                <img
                  src={
                    post.user?.avatar
                      ? `${BASE_URL}/${post.user.avatar}`
                      : `https://api.dicebear.com/8.x/initials/svg?seed=${post.user.name}`
                  }
                  className="w-10 h-10 rounded-full object-cover mt-1 shrink-0"
                  alt="user"
                />
                <p className="text-sm text-[#212529] leading-relaxed flex-1">
                  <Link
                    to={`/profile/${post.user?._id}`}
                    className="font-bold mr-2 hover:underline"
                  >
                    {post.user?.name}
                  </Link>
                  {post.caption}
                </p>
              </div>

              <div className="border-b border-[#E9ECEF]"></div>

              {/* Comments */}
              <h2 className="text-sm font-semibold text-[#6C757D]">
                Comments ({post.comments?.length || 0})
              </h2>

              {post.comments?.map((comment) => (
                <div key={comment._id} className="flex items-start gap-4 group">
                  <img
                    src={
                      comment.user?.avatar
                        ? `${BASE_URL}/${comment.user.avatar}`
                        : `https://api.dicebear.com/8.x/initials/svg?seed=${comment.user?.name}`
                    }
                    className="w-10 h-10 rounded-full object-cover mt-1 shrink-0"
                    alt="commenter"
                  />
                  <div className="flex-1">
                    {editingCommentId === comment._id ? (
                      <div className="flex flex-col">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-sm p-2 border border-gray-300 rounded-md resize-none"
                          rows="3"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-xs text-gray-600 hover:text-black"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="text-xs text-blue-600 hover:text-black"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#212529] leading-relaxed">
                        <Link
                          to={`/profile/${comment.user?._id}`}
                          className="font-bold mr-2 hover:underline"
                        >
                          {comment.user?.name}
                        </Link>
                        {comment.text}
                      </p>
                    )}
                  </div>

                  {comment.user?._id === currentUser?._id &&
                    editingCommentId !== comment._id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingText(comment.text);
                          }}
                          className="text-[#6C757D] hover:text-blue-600"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-[#6C757D] hover:text-red-500"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <button onClick={handleLike} className="p-1">
                  {isLiked ? <LikeIconFilled /> : <LikeIcon />}
                </button>
                <button className="p-1">
                  <CommentIcon />
                </button>
                <ShareButton postId={post._id} />
              </div>
              <button
                className="text-sm font-bold text-[#212529] mt-3 focus:outline-none hover:underline"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: post.likes?.length > 0 ? "pointer" : "default",
                }}
                onClick={() =>
                  post.likes?.length > 0 && setShowLikesModal(true)
                }
                type="button"
                disabled={post.likes?.length === 0}
              >
                {post.likes?.length || 0} likes
              </button>

              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-3 mt-4"
              >
                <img
                  src={
                    currentUser?.avatar
                      ? `${BASE_URL}/${currentUser.avatar}`
                      : `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.name}`
                  }
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-b text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="text-blue-500 disabled:text-gray-400"
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Likes Modal */}
        {showLikesModal && (
          <LikesModal
            users={post.likes}
            onClose={() => setShowLikesModal(false)}
          />
        )}
        )}
        {/* More Posts */}
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 border-t border-gray-200 pt-8">
            More posts from{" "}
            <span className="text-black font-bold">{post.user?.name}</span>
          </h2>

          {morePosts.length === 0 ? (
            <p className="text-sm text-gray-400">
              No other posts by this user.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {morePosts.map((p) => (
                <Link to={`/post/${p._id}`} key={p._id}>
                  <img
                    src={`${BASE_URL}/${p.image}`}
                    alt="More posts"
                    className="grid-image"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2">Delete Post</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to permanently delete this post?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
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
