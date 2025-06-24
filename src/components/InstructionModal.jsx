import React from "react";

const InstructionModal = ({
  isOpen,
  onClose,
  children,
  title = "Development Instructions",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
        style={{ boxShadow: "0 25px 50px -12px rgba(219, 39, 119, 0.15)" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-400 p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/20"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="prose prose-pink max-w-none">{children}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-pink-100 p-4 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-medium rounded-lg text-sm shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <span>Got it</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
