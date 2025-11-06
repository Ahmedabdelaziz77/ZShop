import { kafka } from "packages/utils/kafka";
import prisma from "packages/libs/prisma";
import { Consumer } from "kafkajs";
import { incrementUnseenCount } from "packages/libs/redis/messageRedis";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat.new_message";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;
const MAX_BUFFER_SIZE = 5000;
const RESUME_THRESHOLD = 2000;
const MAX_BACKOFF = 60000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let backoff = BATCH_INTERVAL_MS;
let consumer: Consumer | null = null;

export async function startConsumer() {
  consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`Kafka consumer connected and subscribed to ${TOPIC}`);

  await consumer.run({
    // we'll commit manually after successful DB write
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      if (!message.value) return;

      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        // store offset for this message
        (parsed as any).partition = partition;
        (parsed as any).offset = message.offset;

        buffer.push(parsed);

        if (buffer.length >= MAX_BUFFER_SIZE) {
          console.warn("Buffer limit reached, pausing Kafka consumption...");
          consumer?.pause([{ topic }]);
        }

        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(
            () => flushBufferToDb(topic),
            BATCH_INTERVAL_MS
          );
        }
        // keep session alive during batching
        await heartbeat();
      } catch (err) {
        console.error("Failed to parse Kafka message:", err);
      }
    },
  });
}

async function flushBufferToDb(topic: string) {
  const toInsert = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (toInsert.length === 0) return;

  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));

    await prisma.message.createMany({ data: prismaPayload });

    for (const msg of prismaPayload) {
      const receiverType = msg.senderType === "user" ? "seller" : "user";
      await incrementUnseenCount(receiverType, msg.conversationId);
    }

    // Commit offsets correctly for each partition
    const lastByPartition = new Map<string, string>();
    for (const msg of toInsert as any[]) {
      lastByPartition.set(msg.partition, msg.offset);
    }

    for (const [partition, offset] of lastByPartition) {
      await consumer?.commitOffsets([
        {
          topic,
          partition: Number(partition),
          offset: (Number(offset) + 1).toString(),
        },
      ]);
    }

    backoff = BATCH_INTERVAL_MS;

    console.log(`Flushed ${prismaPayload.length} messages to DB and Redis!`);

    if (buffer.length < RESUME_THRESHOLD) {
      consumer?.resume([{ topic }]);
      console.log("Resumed Kafka consumption");
    }
  } catch (err) {
    console.error("DB insert failed:", err);
    buffer.unshift(...toInsert);

    backoff = Math.min(backoff * 2, MAX_BACKOFF);
    console.warn(`Retrying flush in ${backoff / 1000}s...`);

    flushTimer = setTimeout(() => flushBufferToDb(topic), backoff);
  }
}
