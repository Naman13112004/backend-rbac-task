"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 fade-in">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Backend RBAC Task</h1>
        <p className="text-lg text-slate-600">
          A production-ready scalable backend system with a clean Next.js React frontend.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Create Account</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
