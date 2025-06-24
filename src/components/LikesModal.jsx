import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/apiConfig";

const UserCard = ({ user }) => {
  const avatarUrl = user?.avatar
    ? `${BASE_URL}/${user.avatar}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`;

  return (
    <motion.div
      className="flex items-center justify-between p-3 hover:bg-pink-50/50 transition-all rounded-xl group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Link
        to={`/profile/${user._id}`}
        className="flex items-center gap-3 flex-1"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-pink-100 group-hover:ring-pink-300 transition-all duration-300">
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors truncate max-w-[150px]">
            {user.name}
          </p>
          {user.username && (
            <p className="text-xs text-gray-500">@{user.username}</p>
          )}
        </div>
      </Link>
      <Link
        to={`/profile/${user._id}`}
        className="text-sm bg-gradient-to-r from-pink-500 to-pink-400 text-white font-medium px-3 py-1.5 rounded-lg hover:from-pink-600 hover:to-pink-500 shadow-sm transition-all transform group-hover:translate-x-0.5"
      >
        View
      </Link>
    </motion.div>
  );
};

const LikesModal = ({ users = [], onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : users;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 text-center">
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          ></motion.div>

          {/* Modal container */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <motion.div
            className="inline-block align-middle bg-white rounded-3xl shadow-2xl max-w-md w-full my-8 text-left overflow-hidden transform transition-all max-h-[80vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-400 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                People who liked this post
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition rounded-full p-1 hover:bg-white/20"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search bar */}
            {users.length > 5 && (
              <div className="px-6 py-3 border-b border-gray-100">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Stats bar */}
            <div className="px-6 py-3 bg-pink-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-pink-600 font-bold text-lg">
                    {users.length}
                  </span>{" "}
                  {users.length === 1 ? "person" : "people"} liked this
                </p>
                {searchTerm && filteredUsers.length !== users.length && (
                  <p className="text-xs text-gray-500">
                    Found {filteredUsers.length} of {users.length}
                  </p>
                )}
              </div>
            </div>

            {/* User list with scrollable area */}
            <div className="overflow-y-auto p-4 space-y-2 max-h-[300px] custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  {searchTerm ? (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No users matching "{searchTerm}"
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try a different search term
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No likes yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Be the first to like this post
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {filteredUsers.map((user) => (
                    <UserCard key={user._id} user={user} />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default LikesModal;
