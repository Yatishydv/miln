import React, { useState } from "react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

export default function App() {
  const [inChat, setInChat] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  return (
    <div className="min-h-screen w-full">
      {!inChat ? (
        <Home
          onStart={(info) => {
            setRoomInfo(info);
            setInChat(true);
          }}
        />
      ) : (
        <Chat
          initialRoom={roomInfo}
          onExit={() => {
            setInChat(false);
          }}
        />
      )}
    </div>
  );
}
