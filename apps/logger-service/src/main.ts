import express from "express";
import { WebSocket } from "ws";
import http from "http";
import { consumerKafkaMessages } from "./logger-consumer";
const app = express();

const wsServer = new WebSocket.Server({ noServer: true });

export const clients = new Set<WebSocket>();

wsServer.on("connection", (ws) => {
  console.log("New Logger Client Connected!");
  clients.add(ws);

  ws.on("close", () => {
    console.log("Logger Client Disconnected!");
    clients.delete(ws);
  });
});

const server = http.createServer(app);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request);
  });
});
const port = process.env.PORT || 6008;
server.listen(port, () => {
  console.log(`Listening at http://localhost:6008/api`);
});

// kafka consumer

consumerKafkaMessages();
