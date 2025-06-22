import React from "react";
import PostCard from "./PostCard";

const PostList = ({
  posts,
  user,
  guestLastPostRef,
  authLastPostRef,
  setShowPopup,
  onPostUpdate,
}) => {
  return posts.map((post, index) => {
    if (!post?._id) {
      return (
        <div className="text-red-500 p-4 text-center" key={index}>
          Error: Invalid post data.
        </div>
      );
    }

    const isGuestLast = !user && index === posts.length - 1;
    const isAuthLast = user && index === posts.length - 1;

    return (
      <div
        key={post._id}
        ref={
          isGuestLast
            ? guestLastPostRef
            : isAuthLast
              ? authLastPostRef
              : undefined
        }
      >
        <PostCard
          postData={post}
          setShowPopup={setShowPopup}
          onPostUpdate={onPostUpdate}
        />
      </div>
    );
  });
};

export default PostList;
