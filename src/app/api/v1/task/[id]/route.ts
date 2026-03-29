import { NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/features/task/task.service";
import { UpdateTaskSchema } from "@/features/task/task.schema";
import { apiHandler } from "@/lib/api-handler";

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");
  
  if (!userId || !role) {
    throw new Error("Unauthorized");
  }

  const { id } = await params;
  const body = await req.json();
  const data = UpdateTaskSchema.parse(body);

  const updatedTask = await updateTask(id, userId, role, data);
  return NextResponse.json({ success: true, message: "Task updated", data: updatedTask }, { status: 200 });
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");

  if (!userId || !role) {
    throw new Error("Unauthorized");
  }

  const { id } = await params;
  await deleteTask(id, userId, role);
  return NextResponse.json({ success: true, message: "Task deleted" }, { status: 200 });
});
