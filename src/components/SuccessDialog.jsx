import React from "react";
import { Check, Lock } from "lucide-react";

const icons = {
  success: <Check size={40} />,
  password: <Lock size={40} />,
};

const SuccessDialog = ({
  title,
  message,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  iconType = "success",
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-dialogFadeIn">
        <div className="p-8 flex flex-col items-center">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
              iconType === "password" ? "bg-blue-500" : "bg-green-500"
            }`}
          >
            <div className="text-white">{icons[iconType]}</div>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
          <p className="text-gray-500 text-center mb-6">{message}</p>
          {primaryButtonText && (
            <button
              onClick={onPrimaryButtonClick}
              className="bg-blue-500 text-white w-full py-2 rounded-md font-semibold hover:bg-blue-600 transition mb-3"
            >
              {primaryButtonText}
            </button>
          )}
          {secondaryButtonText && (
            <button
              onClick={onSecondaryButtonClick}
              className="text-blue-500 font-semibold"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;
