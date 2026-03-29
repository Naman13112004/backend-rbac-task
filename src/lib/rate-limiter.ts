import redisClient from "./redis";

export const rateLimit = async (ip: string, limit = 60, windowMs = 60000) => {
  if (!redisClient?.isOpen) return { success: true }; // fail-open if redis is down

  const key = `rl:${ip}`;
  try {
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, Math.floor(windowMs / 1000));
    }

    return {
      success: currentCount <= limit,
      currentCount,
    };
  } catch (error) {
    return { success: true }; // gracefully bypass in case of generic connection faults
  }
};
