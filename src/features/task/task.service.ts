import db from "@/lib/db";
import { z } from "zod";
import { CreateTaskSchema, UpdateTaskSchema } from "./task.schema";
import redisClient from "@/lib/redis";

const invalidateCaches = async (userId: string) => {
  if (redisClient?.isOpen) {
    try {
      await redisClient.del(`tasks:${userId}:USER`);
      await redisClient.del(`tasks:${userId}:ADMIN`);
    } catch (e) {
      // Ignore cache wipe failure silently
    }
  }
};

export const getTasks = async (userId: string, role: string) => {
  const cacheKey = `tasks:${userId}:${role}`;

  if (redisClient?.isOpen) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      // cache miss / error
    }
  }

  const where = role === "ADMIN" ? {} : { userId };
  const tasks = await db.task.findMany({ where, orderBy: { createdAt: "desc" } });

  if (redisClient?.isOpen) {
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(tasks));
    } catch (e) { }
  }

  return tasks;
};

export const createTask = async (userId: string, data: z.infer<typeof CreateTaskSchema>) => {
  const task = await db.task.create({
    data: {
      ...data,
      userId,
    },
  });
  await invalidateCaches(userId);
  return task;
};

export const updateTask = async (
  taskId: string,
  userId: string,
  role: string,
  data: z.infer<typeof UpdateTaskSchema>
) => {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (role !== "ADMIN" && task.userId !== userId) {
    throw new Error("Forbidden: You do not have permission to update this task");
  }

  const processedData = {
    ...data,
    description: data.description === null ? null : data.description
  };

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: processedData,
  });

  await invalidateCaches(task.userId);
  return updatedTask;
};

export const deleteTask = async (taskId: string, userId: string, role: string) => {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (role !== "ADMIN" && task.userId !== userId) {
    throw new Error("Forbidden: You do not have permission to delete this task");
  }

  await db.task.delete({ where: { id: taskId } });
  await invalidateCaches(task.userId);
  return true;
};
