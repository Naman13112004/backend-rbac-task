import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/features/auth/token";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const tokenCookie = request.cookies.get("accessToken");
  const token = tokenCookie?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized: No token provided" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || !payload.userId) {
    return NextResponse.json({ success: false, message: "Unauthorized: Invalid or expired token" }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId as string);
  requestHeaders.set("x-user-role", payload.role as string);

  // Role-Based Access Control logic
  if (pathname.startsWith("/api/v1/admin") && payload.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/v1/task/:path*",
    "/api/v1/admin/:path*",
    "/api/v1/user/:path*",
  ],
};
