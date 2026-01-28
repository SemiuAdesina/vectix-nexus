import type { StateStorage } from './state-storage.types';
import { MemoryStorage } from './memory-storage';
import { RedisStorage } from './redis-storage';

let stateStorage: StateStorage | null = null;

export function getStateStorage(): StateStorage {
  if (stateStorage) return stateStorage;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log('Using Redis storage for horizontal scaling');
    stateStorage = new RedisStorage(redisUrl);
  } else {
    console.log('Using in-memory storage (single instance mode)');
    stateStorage = new MemoryStorage();
  }

  return stateStorage;
}

export async function closeStateStorage(): Promise<void> {
  if (stateStorage) {
    await stateStorage.close();
    stateStorage = null;
  }
}

export type { StateStorage } from './state-storage.types';
export type {
  RateLimitRecord,
  LockoutRecord,
  CircuitBreakerRecord,
} from './state-storage.types';
