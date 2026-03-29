import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/features/task/task.service";
import { CreateTaskSchema } from "@/features/task/task.schema";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req: Request) => {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");

  if (!userId || !role) {
    throw new Error("Unauthorized");
  }

  const tasks = await getTasks(userId, role);
  return NextResponse.json({ success: true, data: tasks }, { status: 200 });
});

export const POST = apiHandler(async (req: Request) => {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const body = await req.json();
  const data = CreateTaskSchema.parse(body);
  const task = await createTask(userId, data);
  
  return NextResponse.json({ success: true, message: "Task created", data: task }, { status: 201 });
});
