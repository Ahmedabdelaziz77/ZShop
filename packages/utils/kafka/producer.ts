import { kafka } from ".";

let _producer: ReturnType<typeof kafka.producer> | null = null;
let _ready = false;

export async function getProducer() {
  if (!_producer) _producer = kafka.producer();
  if (!_ready) {
    await _producer.connect();
    _ready = true;
  }
  return _producer;
}

// optional graceful close (not strictly required)
export async function closeProducer() {
  if (_producer && _ready) {
    await _producer.disconnect();
    _ready = false;
  }
}
