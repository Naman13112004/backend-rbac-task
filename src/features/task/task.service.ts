import db from "@/lib/db";
import { z } from "zod";
import { CreateTaskSchema, UpdateTaskSchema } from "./task.schema";

export const getTasks = async (userId: string, role: string) => {
  const where = role === "ADMIN" ? {} : { userId };
  return await db.task.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const createTask = async (userId: string, data: z.infer<typeof CreateTaskSchema>) => {
  return await db.task.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const updateTask = async (
  taskId: string,
  userId: string,
  role: string,
  data: z.infer<typeof UpdateTaskSchema>
) => {
  const task = await db.task.findUnique({ where: { id: taskId } });
  
  if (!task) {
    throw new Error("Task not found");
  }

  if (role !== "ADMIN" && task.userId !== userId) {
    throw new Error("Forbidden: You do not have permission to update this task");
  }

  // Handle nullable description conversion for Prisma if necessary
  const processedData = {
    ...data,
    description: data.description === null ? null : data.description
  };

  return await db.task.update({
    where: { id: taskId },
    data: processedData,
  });
};

export const deleteTask = async (taskId: string, userId: string, role: string) => {
  const task = await db.task.findUnique({ where: { id: taskId } });
  
  if (!task) {
    throw new Error("Task not found");
  }

  if (role !== "ADMIN" && task.userId !== userId) {
    throw new Error("Forbidden: You do not have permission to delete this task");
  }

  await db.task.delete({ where: { id: taskId } });
  return true;
};
