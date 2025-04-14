"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have an auth hook

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); // Replace with your actual auth hook

  useEffect(() => {
    // Only redirect after authentication state is determined
    if (!isLoading && isAuthenticated) {
      router.replace("/"); // Redirect to home if already logged in
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show the auth pages (login/signup)
  return <div className="auth-layout">{children}</div>;
}
