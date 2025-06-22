import React from "react";
import { X } from "lucide-react";

const ErrorDialog = ({ title = "Error", message, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-dialogFadeIn">
        <div className="p-8 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center mb-6 bg-red-100">
            <X size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
          <p className="text-gray-500 text-center mb-6">{message}</p>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white w-full py-2 rounded-md font-semibold hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog;
