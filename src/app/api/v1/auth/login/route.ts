import { NextResponse } from "next/server";
import { login } from "@/features/auth/auth.service";
import { LoginSchema } from "@/features/auth/auth.schema";
import { env } from "@/config/env";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const data = LoginSchema.parse(body);
  const result = await login(data);

  const response = NextResponse.json(
    { success: true, message: "Login successful", data: result.user },
    { status: 200 }
  );

  response.cookies.set({
    name: "accessToken",
    value: result.token,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
});
