"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";
import { mapAuthErrorMessage } from "@/lib/utils";

// Define a type for your custom user data from Firestore
interface AppUserData {
  username: string;
  email: string;
  role: string;
  createdAt: Date; // Or Timestamp if you store it as Firestore Timestamp
  isAdmin: boolean;
  adhar: number;
}

// Combine Firebase Auth User with your Firestore data
type AppUser = User & AppUserData;

interface AuthContextType {
  user: AppUser | null;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch Firestore data
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            // Combine auth user data with Firestore data
            const appUserData = docSnap.data() as AppUserData;
            setUser({
              ...firebaseUser, // Spread properties from Firebase User
              ...appUserData, // Spread properties from Firestore document
            });
          } else {
            // Handle case where user exists in Auth but not Firestore (optional)
            console.error("User document not found in Firestore!");
            setUser(null); // Or handle as appropriate
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser(null); // Handle error case
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
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
