import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import useAxios from "../hooks/useAxios.js";
import useAuth from "../hooks/useAuth.js";
import { BASE_URL } from "../utils/apiConfig.js";
import SuccessDialog from "../components/SuccessDialog.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";

const CreatePost = () => {
  const { user } = useAuth();
  const api = useAxios();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async () => {
    setError("");
    if (!imageFile) {
      setError("An image is required.");
      return;
    }
    if (!caption.trim()) {
      setError("A caption is required.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", imageFile);

    try {
      await api.post("/posts", formData);
      setShowSuccess(true);
    } catch (err) {
      setError("Failed to create post. Please try again.");
    }
  };

  const userAvatarUrl = user?.avatar
    ? `${BASE_URL}/${user.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`;

  return (
    <div className="flex">
      <Sidebar />

      {showSuccess && (
        <SuccessDialog
          title="Post Created!"
          message="Your post has been successfully shared."
          primaryButtonText="Continue to Feed"
          onPrimaryButtonClick={() => navigate("/")}
        />
      )}

      {error && <ErrorDialog message={error} onConfirm={() => setError("")} />}

      <div className="flex-1 w-full">
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
          <button onClick={() => navigate(-1)}>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-base font-semibold">Create new post</h1>
          <button
            onClick={handlePostSubmit}
            className="text-blue-500 font-semibold"
          >
            Post
          </button>
        </header>

        <div className="upload-container flex flex-col md:flex-row">
          <div
            className="w-full md:w-1/2 bg-white border border-gray-200 flex items-center justify-center relative cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="image-preview"
              />
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload a photo
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 bg-white flex flex-col">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                <img
                  src={userAvatarUrl}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-3 font-semibold text-sm">{user?.name}</span>
            </div>

            <div className="p-4 border-b border-gray-200 flex-grow">
              <textarea
                className="w-full caption-input border-0 outline-none text-sm"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength="2200"
              ></textarea>
              <div className="flex justify-end items-center mt-2">
                <span className="text-gray-400 text-xs">
                  {caption.length}/2,200
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
