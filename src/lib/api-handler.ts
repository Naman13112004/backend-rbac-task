import { NextResponse } from "next/server";
import { z } from "zod";
import logger from "@/lib/logger";

export function apiHandler(
  handler: (req: Request, context: any) => Promise<NextResponse>
) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, message: "Validation failed", errors: error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const message = error.message || "Internal server error";
      let status = 500;

      if (message.toLowerCase().includes("not found")) status = 404;
      else if (message.toLowerCase().includes("invalid") || message.includes("Unauthorized")) status = 401;
      else if (message.includes("Forbidden")) status = 403;
      else if (message.includes("already exists")) status = 409;

      if (status === 500) {
        logger.error("Unhandled API Error:", error);
      }

      return NextResponse.json(
        { success: false, message: status === 500 ? "Internal server error" : message },
        { status }
      );
    }
  };
}
