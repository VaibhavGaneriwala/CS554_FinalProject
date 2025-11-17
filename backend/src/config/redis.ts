import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
    console.log("Redis connected");
});

redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
});

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