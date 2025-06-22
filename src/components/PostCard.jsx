import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { LikeIcon, LikeIconFilled, CommentIcon, SendIcon } from "./Icons";
import TruncatedCaption from "./TruncatedCaption";
import ShareButton from "./ShareButton";
import LikesModal from "./LikesModal";
import { BASE_URL } from "../utils/apiConfig.js";
import toast from "react-hot-toast";
import { formatDistanceToNowStrict } from "date-fns";

const PostCard = ({ postData, setShowPopup, onPostUpdate }) => {
  const { user: loggedInUser } = useAuth();
  const api = useAxios();
  const [comment, setComment] = useState("");
  const [showLikesModal, setShowLikesModal] = useState(false);

  const {
    user: author,
    createdAt,
    image,
    caption = "",
    likes = [],
    comments = [],
    commentsCount = 0,
    _id,
  } = postData;

  const authorAvatarUrl = author?.avatar
    ? `${BASE_URL}/${author.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${author?.name}`;

  const isLiked = loggedInUser
    ? likes.some((like) => like?._id === loggedInUser._id)
    : false;

  const fetchFullPost = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}`);
      if (res.status === 200) {
        onPostUpdate(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch full post:", err);
    }
  };

  const handleLike = async () => {
    if (!loggedInUser) return setShowPopup(true);

    const originalPost = { ...postData };
    const newLikes = isLiked
      ? likes.filter((like) => like?._id !== loggedInUser._id)
      : [...likes, loggedInUser];

    onPostUpdate({ ...postData, likes: newLikes });

    try {
      await api.post(`/posts/${_id}/like`);
    } catch (err) {
      onPostUpdate(originalPost);
      toast.error("Failed to update like.");
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!loggedInUser) return setShowPopup(true);
    if (!comment.trim()) return;

    try {
      await api.post(`/posts/${_id}/comment`, { text: comment });
      setComment("");
      await fetchFullPost(_id);
    } catch (err) {
      toast.error("Failed to post comment");
      console.error("Comment failed", err);
    }
  };

  const timeAgo = formatDistanceToNowStrict(new Date(createdAt), {
    addSuffix: true,
  });

  return (
    <article className="mb-8 max-w-[560px] mx-auto rounded-2xl bg-[#F8F9FA] shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4">
        <Link
          to={loggedInUser ? `/profile/${author?._id}` : "#"}
          onClick={(e) => {
            if (!loggedInUser) {
              e.preventDefault();
              setShowPopup(true);
            }
          }}
          className="w-10 h-10 rounded-full overflow-hidden shrink-0"
        >
          <img
            src={authorAvatarUrl}
            className="w-full h-full object-cover"
            alt={author?.name || "avatar"}
          />
        </Link>
        <div className="ml-4">
          <Link
            to={loggedInUser ? `/profile/${author?._id}` : "#"}
            onClick={(e) => {
              if (!loggedInUser) {
                e.preventDefault();
                setShowPopup(true);
              }
            }}
            className="font-bold text-sm text-[#212529] hover:underline"
          >
            {author?.name || "Unknown User"}
          </Link>
          <p className="text-xs text-[#6C757D]">{timeAgo}</p>
        </div>
      </div>

      {/* Image */}
      <div>
        <Link
          to={loggedInUser ? `/post/${_id}` : "#"}
          onClick={() => !loggedInUser && setShowPopup(true)}
        >
          <img
            src={`${BASE_URL}/${image}`}
            alt={caption.slice(0, 50)}
            className="w-full h-auto object-cover max-h-[700px]"
          />
        </Link>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={handleLike} className="p-1">
              {isLiked ? <LikeIconFilled /> : <LikeIcon />}
            </button>
            <Link
              to={loggedInUser ? `/post/${_id}` : "#"}
              onClick={() => !loggedInUser && setShowPopup(true)}
              className="p-1"
            >
              <CommentIcon />
            </Link>
          </div>
          <ShareButton postId={_id} />
        </div>

        {/* Likes */}
        <button
          onClick={() => likes.length > 0 && setShowLikesModal(true)}
          className="font-bold text-sm text-[#212529] mt-3 hover:underline"
          disabled={likes.length === 0}
        >
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </button>

        {/* Caption */}
        <div className="mt-2">
          <TruncatedCaption
            text={caption}
            author={author?.name || "Unknown User"}
          />
        </div>

        {/* Comments Preview */}
        <div className="mt-2 text-sm">
          {commentsCount > 2 && (
            <Link
              to={loggedInUser ? `/post/${_id}` : "#"}
              onClick={() => !loggedInUser && setShowPopup(true)}
              className="text-[#6C757D] hover:underline"
            >
              View all {commentsCount} comments
            </Link>
          )}
          <div className="space-y-1 mt-1">
            {comments.slice(0, 2).map((comment) =>
              comment ? (
                <p key={comment._id} className="text-[#212529] truncate">
                  <span className="font-bold">{comment.user?.name}</span>
                  <span className="ml-1">{comment.text}</span>
                </p>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <form
        onSubmit={handleCommentSubmit}
        className="border-t border-[#E9ECEF] px-4 py-3 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full bg-transparent focus:outline-none text-sm placeholder:text-[#6C757D]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => !loggedInUser && setShowPopup(true)}
        />
        <button
          type="submit"
          className="text-[#5A7D7C] disabled:text-gray-400"
          disabled={!comment.trim()}
        >
          <SendIcon />
        </button>
      </form>

      {/* Likes Modal */}
      {showLikesModal && (
        <LikesModal users={likes} onClose={() => setShowLikesModal(false)} />
      )}
    </article>
  );
};

export default PostCard;
