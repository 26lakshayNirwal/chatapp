# ChatApp

A full-stack real-time chat application with a React (Vite) frontend and an Express/Socket.IO backend using MongoDB.

## Project Structure

- **chatapp/**: React client (Vite)
- **server/**: Node.js/Express API + Socket.IO

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Optional: Cloudinary account (for media uploads)

## Quick Start

1. Clone/open the project directory.
2. Install dependencies:
   - Client: `cd chatapp/chatapp && npm install`
   - Server: `cd server && npm install`
3. Create environment files:
   - Client: `chatapp/chatapp/.env`
   - Server: `server/.env`
4. Run in development:
   - Terminal A (client): `cd chatapp/chatapp && npm run dev`
   - Terminal B (server): `cd server && npm run dev`

## Environment Variables

### Server (`server/.env`)

- `PORT=5000` (example)
- `MONGODB_URI=<your mongodb connection string>`
- `JWT_SECRET=<your strong secret>`
- `CLIENT_URL=http://localhost:5173` (match Vite dev URL)
- `CLOUDINARY_CLOUD_NAME=<optional>`
- `CLOUDINARY_API_KEY=<optional>`
- `CLOUDINARY_API_SECRET=<optional>`

Check `server/constants/config.js` for additional config usage.

### Client (`chatapp/chatapp/.env`)

- `VITE_SERVER_URL=http://localhost:5000` (backend URL)

## Scripts

### Client (in `chatapp/chatapp/package.json`)

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Lint code

### Server (in `server/package.json`)

- `npm run dev` — Start server with nodemon
- `npm start` — Start server with node

## Tech Stack

- **Frontend**: React, Vite, Redux Toolkit, MUI, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, MongoDB/Mongoose
- **Auth**: JWT, cookies
- **Uploads**: Multer, Cloudinary (optional)

## Development Notes

- Ensure `CLIENT_URL` and CORS settings in the server match your client origin.
- Socket.IO client connects to `VITE_SERVER_URL`; keep ports consistent.
- On Windows, if ports are busy, stop conflicting processes or change `PORT`.

## Build & Deploy (overview)

- Client: `cd chatapp/chatapp && npm run build` → output in `chatapp/chatapp/dist`
- Server: Deploy Node app (render, railway, heroku, etc.). Set env variables accordingly.
- Serve client statically (e.g., from CDN or any static hosting) and point it to your deployed server URL via `VITE_SERVER_URL`.

## Troubleshooting

- Mongo connection errors: verify `MONGODB_URI` and network access (IP whitelist for Atlas).
- CORS or cookie issues: confirm `CLIENT_URL`, HTTPS usage, and cookie flags in production.
- Socket issues: check same-origin/ports and that backend Socket.IO is running.

---

Note: A repository info file `.zencoder/rules/repo.md` is not present. If you'd like, I can auto-generate it to improve future guidance.
