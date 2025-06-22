import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios.js";
import Sidebar from "./Sidebar.jsx";
import toast from "react-hot-toast";

import { BASE_URL } from "../utils/apiConfig.js";

const EditPost = () => {
  const { id } = useParams();
  const api = useAxios();
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) {
      formData.append("image", image);
    }

    try {
      await api.patch(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post updated successfully!");
      navigate(`/post/${id}`);
    } catch (err) {
      toast.error("Failed to update post");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:flex bg-gray-50">
      <Sidebar />
      <div className="max-w-2xl mx-auto py-10 px-4 w-full">
        <h1 className="text-xl font-bold mb-6">Edit Post</h1>

        <form
          onSubmit={handleUpdate}
          className="bg-white p-6 rounded-lg shadow"
        >
          {existingImage && (
            <div className="mb-4">
              <img
                src={`${BASE_URL}/${existingImage}`}
                alt="Current"
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Caption</label>
            <textarea
              className="form-input w-full resize-none"
              rows="4"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Change Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
