import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Share2, Check } from "lucide-react";

const ShareButton = ({ postId }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className="p-2 hover:bg-gray-100 rounded-full transition"
        title="Share post"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-5 w-5 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Share2 className="h-5 w-5 text-gray-600 group-hover:text-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ShareButton;
