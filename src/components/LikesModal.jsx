import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/apiConfig";

const LikesModal = ({ users = [], onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Liked by ({users.length})</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
          </div>

          {/* User List */}
          <div className="overflow-y-auto flex-1 px-4 py-2 space-y-3">
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No likes yet.</p>
            ) : (
              users.map((user, index) => {
                const avatarUrl = user?.avatar
                  ? `${BASE_URL}/${user.avatar}`
                  : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`;

                return (
                  <motion.div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Link
                      to={`/profile/${user._id}`}
                      className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-200"
                    >
                      View
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LikesModal;
