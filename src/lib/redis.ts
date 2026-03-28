import { createClient } from "redis";
import { env } from "@/config/env";
import logger from "./logger";

// Support either full URL or component-based auth from user's env
const redisConfig = env.REDIS_URL
  ? { url: env.REDIS_URL }
  : (env.REDIS_HOST && env.REDIS_PORT) 
      ? {
          socket: {
            host: env.REDIS_HOST,
            port: Number(env.REDIS_PORT),
          },
          password: env.REDIS_PASSWORD,
        }
      : {};

const redisClient = createClient(redisConfig);

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      logger.info("Connected to Redis");
    } catch (error) {
      logger.error("Failed to connect to Redis", error);
    }
  }
};

// Initiate connection silently, since App Router may require top level connect or inside api
connectRedis().catch((err) => logger.error("Redis init error", err));

export default redisClient;
