import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import useAxios from "../hooks/useAxios.js";
import useAuthStore from "../store/useAuthStore";
import SuccessDialog from "../components/SuccessDialog.jsx";
import ErrorDialog from "../components/ErrorDialog.jsx";
import { BASE_URL } from "../utils/apiConfig.js";

const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const EditProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const api = useAxios();

  const [formData, setFormData] = useState({
    bio: "",
    website: "",
    gender: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState({ show: false, message: "" });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        website: user.website || "",
        gender: user.gender || "",
      });
      const initialAvatarUrl = user.avatar
        ? `${BASE_URL}/${user.avatar}`
        : `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`;
      setPreviewUrl(initialAvatarUrl);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessInfo({ show: false, message: "" });
    try {
      await api.patch("/users/me", formData);
      if (avatarFile) {
        const avatarData = new FormData();
        avatarData.append("avatar", avatarFile);
        await api.patch("/users/me/avatar", avatarData);
      }
      const updatedUserResponse = await api.get("/users/me");
      setUser(updatedUserResponse.data);
      setSuccessInfo({ show: true, message: "Profile updated successfully!" });
      setAvatarFile(null);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordStrength < 3) {
      setError("New password is not strong enough.");
      return;
    }

    try {
      await api.patch("/users/me/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordStrength(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  const strengthColorClasses = [
    "bg-gray-200",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  const getStrengthBarColor = (level) => {
    return passwordStrength >= level
      ? strengthColorClasses[passwordStrength]
      : "bg-gray-200";
  };

  return (
    <div className="md:flex bg-gray-50">
      <Sidebar />
      <div className="edit-container p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Edit profile</h1>

        {successInfo.show && (
          <SuccessDialog
            title="Profile Updated"
            message={successInfo.message}
            primaryButtonText="OK"
            onPrimaryButtonClick={() =>
              setSuccessInfo({ show: false, message: "" })
            }
          />
        )}

        {passwordSuccess && (
          <SuccessDialog
            title="Password Updated"
            message="Your password has been changed successfully. Please log in again."
            primaryButtonText="Login"
            onPrimaryButtonClick={logout}
            iconType="password"
          />
        )}

        {error && (
          <ErrorDialog message={error} onConfirm={() => setError("")} />
        )}

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-base">{user?.name}</h2>
              <p className="text-gray-500">@{user?.email?.split("@")[0]}</p>
            </div>
            <label className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition cursor-pointer">
              Change photo
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <label className="block mb-2 font-medium">Website</label>
          <input
            type="text"
            name="website"
            className="form-input mb-2"
            value={formData.website}
            onChange={handleChange}
          />
          <p className="text-gray-500 text-xs">
            Editing your links is only available on mobile.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <label className="block mb-2 font-medium">Bio</label>
          <textarea
            name="bio"
            className="form-input resize-none h-24 mb-1"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
          <div className="flex justify-end">
            <span className="text-gray-500 text-xs">
              {formData.bio.length} / 150
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <label className="block mb-2 font-medium">Gender</label>
          <select
            name="gender"
            className="form-input"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white rounded-lg p-6 mb-6"
        >
          <h2 className="font-medium text-lg mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                className="form-input pr-10"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-sm"
              >
                {showPasswords.current ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                className="form-input pr-10 mb-1"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-sm"
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex w-full h-1 my-1">
              <div className={`w-1/4 ${getStrengthBarColor(1)}`}></div>
              <div className={`w-1/4 ${getStrengthBarColor(2)}`}></div>
              <div className={`w-1/4 ${getStrengthBarColor(3)}`}></div>
              <div className={`w-1/4 ${getStrengthBarColor(4)}`}></div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Use at least 8 characters with a mix of letters, numbers, and
              symbols.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordInputChange}
                className="form-input pr-10"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 text-sm"
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition"
          >
            Change Password
          </button>
        </form>

        <div className="flex justify-end">
          <button
            onClick={handleProfileUpdate}
            className="bg-blue-100 text-blue-500 px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition"
          >
            Submit All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
