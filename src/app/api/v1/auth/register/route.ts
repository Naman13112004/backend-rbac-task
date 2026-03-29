import { NextResponse } from "next/server";
import { register } from "@/features/auth/auth.service";
import { RegisterSchema } from "@/features/auth/auth.schema";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const data = RegisterSchema.parse(body);
  const user = await register(data);

  return NextResponse.json(
    { success: true, message: "User registered successfully", data: user },
    { status: 201 }
  );
});
