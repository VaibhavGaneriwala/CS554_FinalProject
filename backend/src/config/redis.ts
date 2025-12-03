import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST || '';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    retryStrategy: (times) => {
        if (times > 3) {
            return null;
        }
        return Math.min(times * 100, 1000);
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    enableReadyCheck: false,
});

redisClient.on("error", () => {});

export const cacheUtils = {
    async set(key: string, value: any, expirationInSeconds: number = 3600): Promise<void>{
        await redisClient.setex(key, expirationInSeconds, JSON.stringify(value));
    },
    async get(key: string): Promise<any | null>{
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    },
    async del(key: string): Promise<void>{
        await redisClient.del(key);
    },
    async flushAll(): Promise<void>{
        await redisClient.flushall();
    },
};

export default redisClient;