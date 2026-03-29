import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async () => {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.delete("accessToken");
  return response;
});
