"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { z } from "zod";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["user", "collector"]),
  adhar: z.string().regex(/^\d{12}$/, {
    message: "Adhar number must be 12 digits",
  }),
});

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adhar, setAdhar] = useState<string>("");
  //const [error, setError] = useState("");
  const router = useRouter();
  const { signup } = useAuth();

  const handleSignUp = async () => {
    try {
      if (!username || !email || !password || !role || !adhar) {
        alert("Please fill all fields");
        return;
      }

      // Validate input data
      const formData = {
        username,
        email,
        password,
        role,
        adhar,
      };

      signUpSchema.parse(formData);

      const user = await signup(
        username,
        email,
        role,
        parseInt(adhar),
        password
      );

      console.log("User signed up:", user);
      router.push("/");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors;
        errors.forEach((err) => {
          console.error("Validation error:", err.message);
          alert(err.message);
        });
      } else {
        const firebaseError = err as { msg: string };
        console.error("Error signing up:", firebaseError.msg);
        alert(firebaseError.msg);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Sign Up</h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="role"
          >
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="user">User</option>
            <option value="collector">Trast Collector</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="adhar"
          >
            Adhar Number
          </label>
          <input
            type="text"
            id="adhar"
            value={adhar}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setAdhar(digits);
            }}
            placeholder="Enter your adhar number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSignUp}
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
