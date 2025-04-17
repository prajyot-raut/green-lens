"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";
import { mapAuthErrorMessage } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (
    username: string,
    email: string,
    role: string,
    adhar: number,
    password: string
  ) => Promise<UserCredential>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const signIn = await signInWithEmailAndPassword(auth, email, password);
      return signIn;
    } catch (error) {
      console.log("Error logging in:", error);

      const firebaseError = error as { code: string };
      throw { msg: mapAuthErrorMessage(firebaseError.code) };
    }
  };

  const signup = async (
    username: string,
    email: string,
    role: string,
    adhar: number,
    password: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        role: role,
        createdAt: new Date(),
        isAdmin: false,
        adhar: adhar,
      });

      return userCredential;
    } catch (error) {
      console.log("Error signing up:", error);

      const firebaseError = error as { code: string };
      throw { msg: mapAuthErrorMessage(firebaseError.code) };
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  return useContext(AuthContext) as AuthContextType;
}
