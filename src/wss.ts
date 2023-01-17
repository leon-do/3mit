import WebSocket from "ws";

const wss = new WebSocket.WebSocketServer({ port: 8080 });

export default wss;
