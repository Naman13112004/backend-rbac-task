import { NextResponse } from "next/server";
import { login } from "@/features/auth/auth.service";
import { LoginSchema } from "@/features/auth/auth.schema";
import { z } from "zod";
import logger from "@/lib/logger";
import { env } from "@/config/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const result = await login(data);

    const response = NextResponse.json(
      { success: true, message: "Login successful", data: result.user },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: "accessToken",
      value: result.token,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    logger.error("Login Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors }, { status: 400 });
    }
    const message = error.message || "Something went wrong";
    const status = message === "Invalid email or password" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
