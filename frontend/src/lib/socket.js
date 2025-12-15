import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

// Basic diagnostics
socket.on("connect", () => console.log("[socket] connected", socket.id));
socket.on("connect_error", (err) => console.warn("[socket] connect_error", err?.message || err));
socket.on("error", (err) => console.warn("[socket] error", err?.message || err));
socket.on("disconnect", (reason) => console.log("[socket] disconnected", reason));

export default socket;
