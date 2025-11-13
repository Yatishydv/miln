import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatBox({ messages, onSend }) {
  const [value, setValue] = useState("");
  const scroller = useRef();

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages]);

  function submit(e) {
    e && e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <div className="flex flex-col h-full bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl p-4">
      <div ref={scroller} className="flex-1 overflow-auto p-3 space-y-3">
        {messages.length === 0 && <div className="text-sm text-white/60">Say hi 👋</div>}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-3 items-center">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 bg-white/8 border border-white/10 rounded-full px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
        />
        <button type="submit" className="px-4 py-2 rounded-full bg-white text-indigo-700 font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}
