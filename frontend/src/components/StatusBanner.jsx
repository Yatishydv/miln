import React from "react";

export default function StatusBanner({ status, typing }) {
  const map = {
    searching: "Looking for a stranger...",
    matched: "Matched — establishing connection...",
    connecting: "Connecting…",
    connected: "Connected",
  };

  return (
    <div className="inline-block px-3 py-2 rounded-xl bg-white/8 text-white text-sm border border-white/10 shadow-sm">
      <div>{map[status] || status}</div>
      {typing && <div className="text-xs text-white/70 mt-1">Stranger is typing…</div>}
    </div>
  );
}
