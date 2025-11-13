import React from "react";

export default function MessageBubble({ message }) {
  if (message.system) {
    return <div className="text-center text-sm text-white/70">{message.text}</div>;
  }

  if (message.from === "you") {
    return (
      <div className="flex justify-end">
        <div className="bg-white text-indigo-700 px-4 py-2 rounded-2xl max-w-[75%] shadow">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-2xl max-w-[75%] shadow-sm">
        {message.text}
      </div>
    </div>
  );
}
