import React, { useState } from "react";

const TruncatedCaption = ({ text = "", author }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 100;

  if (text.length <= charLimit) {
    return (
      <p className="text-sm">
        <span className="font-semibold">{author}</span> {text}
      </p>
    );
  }

  return (
    <p className="text-sm">
      <span className="font-semibold">{author}</span>
      {isExpanded ? ` ${text} ` : ` ${text.slice(0, charLimit)}... `}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-gray-500 font-semibold ml-1"
      >
        {isExpanded ? "Show Less" : "more"}
      </button>
    </p>
  );
};

export default TruncatedCaption;
