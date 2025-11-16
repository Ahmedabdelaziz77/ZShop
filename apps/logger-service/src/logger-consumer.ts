import { kafka } from "packages/utils/kafka";
import { clients } from "./main";

const consumer = kafka.consumer({ groupId: "log-events-group" });
const logQueue: string[] = [];

const processLogs = () => {
  if (logQueue.length === 0) return;
  console.log(`processing ${logQueue.length} logs in a patch`);
  const logs = [...logQueue];
  logQueue.length = 0;

  clients.forEach((client) => {
    logs.forEach((log) => {
      client.send(log);
    });
  });
};

setInterval(processLogs, 3000);

// CONSUMING LOGS FROM KAFKA
export const consumerKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const log = message.value.toString();
      logQueue.push(log);
    },
  });
};

consumerKafkaMessages().catch(console.error);
