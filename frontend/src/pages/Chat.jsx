import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import StatusBanner from "../components/StatusBanner";

const SIGNAL_SERVER = import.meta.env.VITE_SIGNAL_URL || "http://localhost:4000";

export default function Chat({ onExit }) {
  const socket = useRef();
  const pc = useRef(null);
  const dataChannel = useRef(null);

  const localVideo = useRef();
  const remoteVideo = useRef();
  const localStream = useRef();

  const [status, setStatus] = useState("searching");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const roomId = useRef(null);
  const partnerId = useRef(null);
  const isOfferer = useRef(false);

  // ----------- CLEANUP FUNCTION -----------
  function cleanupPeer() {
    console.log("Cleaning up WebRTC connection...");

    try {
      if (pc.current) {
        pc.current.ontrack = null;
        pc.current.onicecandidate = null;
        pc.current.ondatachannel = null;
        pc.current.close();
      }
    } catch (e) {
      console.warn("Peer close failed:", e);
    }

    pc.current = null;
    dataChannel.current = null;

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
  }

  function stopLocalStream() {
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
    if (localVideo.current) {
      localVideo.current.srcObject = null;
    }
  }

  // ---------- SOCKET SETUP ----------
  useEffect(() => {
    socket.current = io(SIGNAL_SERVER);

    socket.current.on("connect", () => {
      setStatus("searching");
      socket.current.emit("find_stranger");
    });

    socket.current.on("matched", ({ roomId: r, partnerId: p }) => {
      roomId.current = r;
      partnerId.current = p;
      isOfferer.current = socket.current.id.localeCompare(p) < 0;
      setStatus("matched");
    });

    socket.current.on("ready", async () => {
      await startLocalStream();
      createPeer();
      if (isOfferer.current) await createOffer();
    });

    socket.current.on("signal", async ({ type, data }) => {
      if (!pc.current) return;

      if (type === "offer" && !isOfferer.current) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(data));
        await createAnswer();
      }

      if (type === "answer" && isOfferer.current) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(data));
      }

      if (type === "ice" && data) {
        try {
          await pc.current.addIceCandidate(data);
        } catch (_) {}
      }
    });

    socket.current.on("partner_disconnected", () => {
      cleanupPeer();
      setMessages((m) => [...m, { system: true, text: "Partner disconnected." }]);
      setStatus("searching");

      socket.current.emit("find_stranger");
    });

    socket.current.on("skipped", () => {
      cleanupPeer();
      setMessages((m) => [...m, { system: true, text: "Stranger skipped." }]);
      setStatus("searching");
      socket.current.emit("find_stranger");
    });

    // cleanup on close tab
    return () => {
      console.log("Tab closing → cleanup");
      cleanupPeer();
      stopLocalStream();
      socket.current?.disconnect();
    };
  }, []);

  // ---------- MEDIA ----------
  async function startLocalStream() {
    if (localStream.current) return;

    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideo.current.srcObject = localStream.current;
  }

  // ---------- PEER ----------
  function createPeer() {
    cleanupPeer(); // ensure fresh peer

    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.current.getTracks().forEach((t) => pc.current.addTrack(t, localStream.current));

    pc.current.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
      setStatus("connected");
    };

    pc.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit("signal", {
          to: partnerId.current,
          type: "ice",
          data: e.candidate,
        });
      }
    };

    if (isOfferer.current) {
      dataChannel.current = pc.current.createDataChannel("chat");
      setupDC(dataChannel.current);
    }

    pc.current.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      setupDC(dataChannel.current);
    };
  }

  function setupDC(dc) {
    dc.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "chat") {
        setMessages((m) => [...m, { from: "stranger", text: msg.text }]);
      }
      if (msg.type === "typing") setTyping(msg.isTyping);
    };
  }

  // -------- OFFER / ANSWER --------
  async function createOffer() {
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.current.emit("signal", {
      to: partnerId.current,
      type: "offer",
      data: offer,
    });
  }

  async function createAnswer() {
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    socket.current.emit("signal", {
      to: partnerId.current,
      type: "answer",
      data: answer,
    });
  }

  // ---------------- SKIP ----------------
  function skip() {
    console.log("Skip clicked → cleanup & find new stranger");

    cleanupPeer();
    stopLocalStream();

    socket.current.emit("skip", { roomId: roomId.current });

    setMessages([]);
    setStatus("searching");
  }

  // ------------ SEND MESSAGE ------------
  function sendMessage(text) {
    setMessages((m) => [...m, { from: "you", text }]);

    const payload = JSON.stringify({ type: "chat", text });

    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send(payload);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="max-w-6xl mx-auto bg-white/8 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-6 flex gap-6 h-[82vh]">
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 rounded-2xl overflow-hidden">
            <VideoPlayer localRef={localVideo} remoteRef={remoteVideo} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={skip} className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-semibold shadow-md">
              Skip 🔄
            </button>

            <button
              onClick={() => {
                cleanupPeer();
                stopLocalStream();
                onExit();
              }}
              className="px-5 py-2 rounded-xl bg-transparent border border-white/30 text-white shadow-md"
            >
              Exit ❌
            </button>

            <StatusBanner status={status} typing={typing} />
          </div>
        </div>

        <div className="w-1/2 h-full">
          <ChatBox messages={messages} onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}
