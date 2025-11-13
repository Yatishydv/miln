import React from "react";

export default function VideoPlayer({ localRef, remoteRef }) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
        {/* If remote video is not available, show a subtle message */}
        <div className="absolute pointer-events-none text-white/60 text-center p-4">
          {/* empty overlay to keep layout consistent */}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <video ref={localRef} autoPlay muted playsInline className="w-28 h-20 rounded-lg object-cover bg-black shadow-lg" />
        <div className="text-white/90 text-sm">Local Preview</div>
      </div>
    </div>
  );
}
