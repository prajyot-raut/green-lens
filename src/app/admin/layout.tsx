"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth(); // Assuming user object has role, e.g., user.role === 'admin'
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect if not authenticated OR if authenticated but not an admin
      if (!isAuthenticated || (isAuthenticated && !user?.isAdmin)) {
        // Redirect to login or a 'not authorized' page
        console.log(user);
        //router.push("/"); // Or perhaps router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    // Still loading auth state
    return <div>Loading...</div>;
  }

  // If authenticated AND is an admin, render the children
  if (isAuthenticated && user?.isAdmin) {
    return <>{children}</>;
  }

  // If loading is finished, but user is not authenticated or not an admin,
  // return null or a message while the redirect in useEffect happens.
  // Returning null avoids rendering anything briefly before redirect.
  return null;
  // Alternatively, show an "Access Denied" message:
  // return <div>Access Denied. You must be an admin to view this page.</div>;
}
