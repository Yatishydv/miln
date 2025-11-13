# Miln — Anonymous Random Video & Text Chat (Omegle Alternative)

This repository contains a full-stack anonymous random chat application built with React + Vite (frontend) and Node.js + Express + Socket.io (backend). It supports random matchmaking, peer-to-peer video/audio using WebRTC (via simple-peer), text chat, typing indicators, skip/leave, and responsive UI.

## Project structure

miln/
├── frontend/  (React + Vite)
└── backend/   (Express + Socket.io signaling)

## Quickstart (local)

1. Clone or unzip the project.
2. Start backend:
   - `cd backend`
   - `npm install`
   - Copy `.env.example` to `.env` and edit if needed (PORT, FRONTEND_ORIGIN)
   - `npm run dev` (requires nodemon) or `npm start`

3. Start frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Open `http://localhost:5173`

## Environment variables

Backend:
- `PORT` (default 4000)
- `FRONTEND_ORIGIN` (for CORS)

Frontend:
- `VITE_SIGNAL_URL` — set `http://localhost:4000` by default

## Testing / Verification

- Open two separate browser windows (or use two different devices) and visit the frontend.
- Click **Start Chat** in both windows — they will be matched randomly.
- Allow camera & mic permissions.
- You should see local preview and remote video when connected.
- Send messages — they should appear in both windows.
- Click **Skip** to search for another stranger.
- Close a tab — the partner will receive 'Partner disconnected' message.

## Notes & Limitations

- This implementation uses a simple simple-peer setup with signaling over Socket.io.
- For production you should:
  - Use HTTPS and secure WebSocket (wss).
  - Deploy behind a server with proper CORS and origin checks.
  - Add TURN server (coturn) for NAT traversal — otherwise P2P may fail behind some routers.
  - Add rate-limiting and abuse prevention.
  - Add moderation tools and Terms of Use.

## Bonus features included

- Mobile responsive layout
- Auto-scroll chat
- "Looking for a stranger..." status
- Clean modern UI built with TailwindCSS

## Files preview

The ZIP includes all frontend and backend source code, package.json files, and this README.

# miln
