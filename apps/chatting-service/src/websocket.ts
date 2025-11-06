import { Server } from "http";
import redis from "packages/libs/redis";
import { kafka } from "packages/utils/kafka";
import { WebSocketServer, WebSocket } from "ws";
const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: Server) {
  // Create WebSocket Server
  const wss = new WebSocketServer({ server });

  await producer.connect();
  console.log("Kafka producer connected successfully!");

  // Handle New Connections
  wss.on("connection", (ws: WebSocket) => {
    console.log("New Websocket connection recieved!");

    let registeredUserId: string | null = null;
    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        // First Message = Register User

        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`registered websocket or userId: ${registeredUserId}`);

          const isSeller = registeredUserId.startsWith("seller_");
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;

          await redis.set(redisKey, "1");
          await redis.expire(redisKey, 300);
          return;
        }

        const data: IncomingMessage = JSON.parse(messageStr);

        // Handle Seen Updates
        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!data || !toUserId || !conversationId || !messageBody) {
          console.warn("Invalid message format:", data);
          return;
        }

        // Create a Message Payload for Kafka
        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        // Determine Sender/Receiver Keys
        const receiverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        // Update Unseen Count
        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // Deliver Message to Receiver (if online)
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );
          console.log(`Delivered message + unseen counts to ${receiverKey}`);
        } else console.log(`User ${receiverKey} is offline. Message queued!`);

        // Echo Back to Sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${senderKey}`);
        }

        // Queue Message to Kafka
        await producer.send({
          topic: "chat.new_message",
          messages: [
            { key: conversationId, value: JSON.stringify(messagePayload) },
          ],
        });
        console.log(`Message queued to kafka: ${conversationId}`);
      } catch (err) {
        console.error("Error processing Websocket message");
      }
    });

    // Handle Disconnection
    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected user ${registeredUserId}`);
        const isSeller = registeredUserId.startsWith("seller_");
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace("seller_", "")}`
          : `online:user:${registeredUserId}`;

        await redis.del(redisKey);
      }
    });

    // Error Handling
    ws.on("error", (err) => {
      console.error("Websocket error:", err);
    });
  });
  console.log("Websocket server ready!");
}
