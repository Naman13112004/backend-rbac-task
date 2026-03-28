import { NextResponse } from "next/server";
import { register } from "@/features/auth/auth.service";
import { RegisterSchema } from "@/features/auth/auth.schema";
import { z } from "zod";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const user = await register(data);

    return NextResponse.json(
      { success: true, message: "User registered successfully", data: user },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("Registration Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors }, { status: 400 });
    }
    const message = error.message || "Something went wrong";
    const status = message === "User already exists" ? 409 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
