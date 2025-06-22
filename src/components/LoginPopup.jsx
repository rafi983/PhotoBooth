import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modal = {
  hidden: { scale: 0.95, opacity: 0, y: -50 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, type: "spring", stiffness: 120 },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: -30,
    transition: { duration: 0.2 },
  },
};

const LoginPopup = ({ setShowPopup }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-white w-[90%] max-w-md rounded-xl shadow-2xl p-8 relative"
          variants={modal}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            onClick={() => setShowPopup(false)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2 text-center">
            Join PhotoBooth
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Log in to like, comment, and follow your favorite creators.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="bg-blue-500 text-white py-2 rounded-md font-medium hover:bg-blue-600 transition text-center"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-100 transition text-center"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-400 text-center">
            By continuing, you agree to our{" "}
            <span className="underline">Terms</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPopup;
