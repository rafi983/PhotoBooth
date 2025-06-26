import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAxios from "../hooks/useAxios.js";
import Sidebar from "../components/Sidebar.jsx";
import toast from "react-hot-toast";

import { BASE_URL } from "../utils/apiConfig.js";

const EditPost = ({ onPostUpdate }) => {
  const { id } = useParams();
  const api = useAxios();
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setCaption(res.data.caption);
        setExistingImage(res.data.image);
      } catch (err) {
        toast.error("Failed to load post");
        console.error(err);
      }
    };
    fetchPost();
  }, [api, id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await api.patch(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Notify parent or home page about the update
      if (response.data && typeof onPostUpdate === "function") {
        onPostUpdate(response.data);
      }

      setUpdateSuccess(true);
      toast.success("Post updated successfully");

      // Start fade out animation
      setTimeout(() => {
        setFadeOut(true);
      }, 800);

      // Navigate after animation completes
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      toast.error("Failed to update post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Define animation classes based on state
  const formClasses = `bg-white/90 rounded-2xl shadow-lg p-6 md:p-8 backdrop-blur-md 
    ${fadeOut ? "opacity-0 transform translate-y-4" : "opacity-100"} 
    ${updateSuccess ? "border-green-400 border-2" : ""} 
    transition-all duration-500 ease-in-out`;

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-tr from-white to-pink-50 p-4 md:p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
            <Link
              to={`/post/${id}`}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
            >
              Cancel
            </Link>
          </div>

          <form onSubmit={handleUpdate} className={formClasses}>
            {updateSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10 animate-fade-in">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-16 h-16 text-green-500 mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900">
                    Post Updated Successfully!
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Redirecting to your post...
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Preview */}
              <div className="order-2 md:order-1">
                <div className="bg-gray-50 rounded-xl overflow-hidden shadow-inner aspect-square flex items-center justify-center mb-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : existingImage ? (
                    <img
                      src={`${BASE_URL}/${existingImage}`}
                      alt="Current"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center p-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p>No image selected</p>
                    </div>
                  )}
                </div>

                <label className="block relative cursor-pointer bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white font-medium py-3 px-4 rounded-lg text-center shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Change Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading || updateSuccess}
                  />
                </label>
              </div>

              {/* Form Fields */}
              <div className="order-1 md:order-2">
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Caption
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 resize-none transition-colors"
                    rows="8"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption for your post..."
                    required
                    disabled={loading || updateSuccess}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
                  disabled={loading || updateSuccess}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating Post...
                    </>
                  ) : updateSuccess ? (
                    "Post Updated!"
                  ) : (
                    "Update Post"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditPost;
