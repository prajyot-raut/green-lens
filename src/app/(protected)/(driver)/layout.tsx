"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; // Adjust path as needed
import { useRouter } from "next/navigation"; // Import useRouter

// Assuming your useAuth hook provides user object like:
// interface User { uid: string; email: string; role?: string; /* other fields */ }
// And potentially a loading state: authLoading?: boolean;

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth(); // Get user and loading state from your auth context
  const router = useRouter();

  useEffect(() => {
    // Wait until auth state is determined
    // If user is not logged in OR user doesn't have the 'driver' role
    if (!user || user.role !== "collector") {
      console.warn("Access denied: User is not a driver or not logged in.");
      // Redirect to a suitable page, e.g., home or an unauthorized page
      router.push("/"); // Or '/unauthorized' or '/login'
    }
  }, [user, router]);

  // Show loading state while checking auth/role
  if (!user) {
    // Or user?.role !== 'driver' if you want to show loading until confirmed driver
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading driver area...</p> {/* Or a spinner component */}
      </div>
    );
  }

  // If user is logged in AND has the 'driver' role, render the children
  if (user && user.role === "collector") {
    return <>{children}</>;
  }

  // Fallback in case redirection hasn't happened yet (optional, depends on desired UX)
  // You might already be redirecting in useEffect, so this might not be strictly needed
  // or could show an "Access Denied" message instead of just loading.
  return (
    <div className="flex justify-center items-center h-screen">
      <p>Verifying access...</p>
    </div>
  );
}
