"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    try {
      const handleLogout = async () => {
        await logout();
        console.log("User logged out");
        router.push("/");
      };
      handleLogout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [logout, router]);

  return null;
}
