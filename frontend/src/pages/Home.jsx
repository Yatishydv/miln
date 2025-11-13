import React from "react";

export default function Home({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="max-w-3xl w-full rounded-3xl bg-white/8 backdrop-blur-2xl border border-white/20 p-10 shadow-2xl text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">M</div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Miln</h1>
            <p className="text-sm mt-1 opacity-90">Anonymous random video & text chat — meet strangers instantly.</p>
          </div>
        </div>

        <p className="text-lg mb-6 opacity-95">
          Connect with a random stranger through secure, anonymous peer-to-peer video and chat. Be kind, respectful, and enjoy meeting new people.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={() => onStart({})}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold text-lg shadow-lg hover:scale-[1.02] transition"
          >
            Start Chat 🚀
          </button>

          <a
            href="#info"
            className="text-sm mt-2 sm:mt-0 text-white/90 underline underline-offset-2"
          >
            How it works
          </a>
        </div>

        <div id="info" className="mt-8 text-sm text-white/80">
          <ul className="space-y-2">
            <li>• 100% anonymous — no login required</li>
            <li>• Peer-to-peer video (no server recording)</li>
            <li>• Skip, reconnect and typing indicators included</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
